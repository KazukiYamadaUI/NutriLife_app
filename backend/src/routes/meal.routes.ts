import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { aiService } from '../services/ai.service';

const router = Router();

// All meal routes require authentication
router.use(authMiddleware);

// POST /api/meals/analyze
router.post('/analyze', upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const imagePath = req.file?.path;

    // Parse context from request
    let lifestyle = {};
    let healthData = {};
    try {
      if (req.body.lifestyle) lifestyle = JSON.parse(req.body.lifestyle);
      if (req.body.healthData) healthData = JSON.parse(req.body.healthData);
    } catch {
      // Ignore parse errors
    }

    // Get user profile for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { lifestyle: true },
    });

    // Analyze with AI
    const analysis = await aiService.analyzeMealImage(imagePath || '', {
      lifestyle: user?.lifestyle || lifestyle,
      healthData,
      userProfile: user
        ? {
            gender: user.gender || undefined,
            birthYear: user.birthYear || undefined,
            height: user.height || undefined,
            weight: user.weight || undefined,
          }
        : undefined,
    });

    // Save to database
    const now = new Date();
    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        name: analysis.name,
        cal: analysis.cal,
        protein: analysis.protein,
        fat: analysis.fat,
        carbs: analysis.carbs,
        fiber: analysis.fiber,
        salt: analysis.salt,
        score: analysis.score,
        ingredients: analysis.ingredients,
        advice: analysis.advice,
        missing: analysis.missing,
        praise: analysis.praise,
        imageUrl: imagePath,
        date: now.toDateString(),
        time: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`,
      },
    });

    // Return in the format the frontend expects
    res.json({
      id: mealLog.id,
      name: mealLog.name,
      cal: mealLog.cal,
      p: mealLog.protein,
      f: mealLog.fat,
      c: mealLog.carbs,
      fiber: mealLog.fiber,
      salt: mealLog.salt,
      score: mealLog.score,
      ingredients: mealLog.ingredients,
      advice: mealLog.advice,
      missing: mealLog.missing,
      praise: mealLog.praise,
      date: mealLog.date,
      time: mealLog.time,
    });
  } catch (error) {
    console.error('Meal analysis error:', error);
    res.status(500).json({ error: '食事の解析に失敗しました' });
  }
});

// GET /api/meals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { date, month } = req.query;

    const where: any = { userId };
    if (date) {
      where.date = date as string;
    } else if (month) {
      // month format: "2026-02"
      const [y, m] = (month as string).split('-').map(Number);
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0);
      where.createdAt = {
        gte: start,
        lte: end,
      };
    }

    const meals = await prisma.mealLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json(
      meals.map((m) => ({
        id: m.id,
        name: m.name,
        cal: m.cal,
        p: m.protein,
        f: m.fat,
        c: m.carbs,
        fiber: m.fiber,
        salt: m.salt,
        score: m.score,
        ingredients: m.ingredients,
        advice: m.advice,
        missing: m.missing,
        praise: m.praise,
        date: m.date,
        time: m.time,
        feedback: m.feedback,
      }))
    );
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: '記録の取得に失敗しました' });
  }
});

// GET /api/meals/:id
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const meal = await prisma.mealLog.findFirst({
      where: { id: id as string, userId },
    });

    if (!meal) {
      res.status(404).json({ error: '記録が見つかりません' });
      return;
    }

    res.json({
      id: meal.id,
      name: meal.name,
      cal: meal.cal,
      p: meal.protein,
      f: meal.fat,
      c: meal.carbs,
      fiber: meal.fiber,
      salt: meal.salt,
      score: meal.score,
      ingredients: meal.ingredients,
      advice: meal.advice,
      missing: meal.missing,
      praise: meal.praise,
      date: meal.date,
      time: meal.time,
      feedback: meal.feedback,
    });
  } catch (error) {
    console.error('Get meal detail error:', error);
    res.status(500).json({ error: '記録の取得に失敗しました' });
  }
});

// POST /api/meals/:id/feedback
router.post('/:id/feedback', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { type } = z.object({ type: z.enum(['good', 'bad']) }).parse(req.body);

    await prisma.mealLog.updateMany({
      where: { id: id as string, userId },
      data: { feedback: type },
    });

    res.json({ message: 'フィードバックありがとうございます' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: '無効なフィードバックです' });
      return;
    }
    throw error;
  }
});

export default router;
