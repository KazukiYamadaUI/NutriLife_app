import { supabase } from '@/lib/supabase';
import { User, MealLog, MealAnalysis, Lifestyle, HealthData } from '@/types';
import * as FileSystem from 'expo-file-system';

// ============================================================
// Profiles
// ============================================================

export interface ProfileResult {
  user: User;
  isProfileComplete: boolean;
}

export async function getProfile(userId: string): Promise<ProfileResult | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return {
    user: profileRowToUser(data),
    isProfileComplete: data.is_profile_complete,
  };
}

export async function upsertProfile(userId: string, profile: Partial<User>): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      display_name: profile.displayName ?? 'ユーザー',
      gender: profile.gender ?? null,
      birth_year: profile.birthYear ?? null,
      height: profile.height ?? null,
      weight: profile.weight ?? null,
      is_profile_complete: true,
    }, { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(`Profile upsert failed: ${error.message}`);
  return profileRowToUser(data!);
}

export async function updateProfile(userId: string, profile: Partial<User>): Promise<User> {
  const update: Record<string, unknown> = {};
  if (profile.displayName !== undefined) update.display_name = profile.displayName;
  if (profile.gender !== undefined) update.gender = profile.gender;
  if (profile.birthYear !== undefined) update.birth_year = profile.birthYear;
  if (profile.height !== undefined) update.height = profile.height;
  if (profile.weight !== undefined) update.weight = profile.weight;

  const { data, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error(`Profile update failed: ${error.message}`);
  return profileRowToUser(data!);
}

function profileRowToUser(row: {
  id: string;
  phone: string | null;
  display_name: string;
  gender: string | null;
  birth_year: string | null;
  height: string | null;
  weight: string | null;
  is_profile_complete: boolean;
}): User {
  return {
    id: row.id,
    phone: row.phone ?? undefined,
    displayName: row.display_name,
    gender: (row.gender as User['gender']) ?? '',
    birthYear: row.birth_year ?? undefined,
    height: row.height ?? undefined,
    weight: row.weight ?? undefined,
  };
}

// ============================================================
// Meal Logs
// ============================================================

export async function getMealLogs(
  userId: string,
  params?: { date?: string; month?: string }
): Promise<MealLog[]> {
  let query = supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (params?.date) {
    query = query.eq('date', params.date);
  }
  if (params?.month) {
    query = query.like('date', `%${params.month}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(`Fetch meal logs failed: ${error.message}`);
  return (data ?? []).map(mealLogRowToMealLog);
}

export async function insertMealLog(
  userId: string,
  analysis: MealAnalysis,
  date: string,
  time: string,
  imageUrl?: string
): Promise<MealLog> {
  const { data, error } = await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      name: analysis.name,
      cal: analysis.cal,
      protein: analysis.p,
      fat: analysis.f,
      carbs: analysis.c,
      fiber: analysis.fiber,
      salt: analysis.salt,
      score: analysis.score,
      ingredients: analysis.ingredients,
      advice: analysis.advice,
      missing: analysis.missing,
      praise: analysis.praise,
      image_url: imageUrl ?? null,
      date,
      time,
    })
    .select()
    .single();

  if (error) throw new Error(`Insert meal log failed: ${error.message}`);
  return mealLogRowToMealLog(data!);
}

export async function deleteMealLog(userId: string, logId: string): Promise<void> {
  const { error } = await supabase
    .from('meal_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) throw new Error(`Delete meal log failed: ${error.message}`);
}

export async function searchMealLogs(
  userId: string,
  query: string
): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(`Search meal logs failed: ${error.message}`);
  return (data ?? []).map(mealLogRowToMealLog);
}

export async function uploadMealImage(
  userId: string,
  imageUri: string
): Promise<string | null> {
  try {
    const ext = imageUri.split('.').pop() || 'jpg';
    const fileName = `${userId}/${Date.now()}.${ext}`;
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error } = await supabase.storage
      .from('meal-images')
      .upload(fileName, decode(base64), {
        contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        upsert: false,
      });

    if (error) {
      console.error('Image upload failed:', error.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('meal-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (e) {
    console.error('Image upload error:', e);
    return null;
  }
}

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function deleteAccount(userId: string): Promise<void> {
  const { error: rpcError } = await supabase.rpc('delete_own_account');
  if (!rpcError) return;

  console.warn('delete_own_account RPC failed, falling back to manual deletion:', rpcError.message);

  const { error: mealErr } = await supabase
    .from('meal_logs')
    .delete()
    .eq('user_id', userId);
  if (mealErr) console.error('Failed to delete meal_logs:', mealErr.message);

  const { error: lifestyleErr } = await supabase
    .from('lifestyles')
    .delete()
    .eq('user_id', userId);
  if (lifestyleErr) console.error('Failed to delete lifestyles:', lifestyleErr.message);

  const { error: healthErr } = await supabase
    .from('health_data')
    .delete()
    .eq('user_id', userId);
  if (healthErr) console.error('Failed to delete health_data:', healthErr.message);

  try {
    const { data: files } = await supabase.storage
      .from('meal-images')
      .list(userId);
    if (files && files.length > 0) {
      const paths = files.map((f) => `${userId}/${f.name}`);
      await supabase.storage.from('meal-images').remove(paths);
    }
  } catch (e) {
    console.error('Failed to delete meal images from storage:', e);
  }

  const { error: profileErr } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profileErr) throw new Error(`Account deletion failed: ${profileErr.message}`);
}

export async function updateMealLogFeedback(
  userId: string,
  logId: string,
  feedback: 'good' | 'bad'
): Promise<void> {
  const { error } = await supabase
    .from('meal_logs')
    .update({ feedback })
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) throw new Error(`Update feedback failed: ${error.message}`);
}

function mealLogRowToMealLog(row: {
  id: string;
  name: string;
  cal: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  salt: number;
  score: number;
  ingredients: string[];
  advice: string | null;
  missing: string | null;
  praise: string | null;
  image_url: string | null;
  feedback: string | null;
  date: string;
  time: string;
}): MealLog {
  return {
    id: row.id,
    name: row.name,
    cal: row.cal,
    p: row.protein,
    f: row.fat,
    c: row.carbs,
    fiber: row.fiber,
    salt: row.salt,
    score: row.score,
    ingredients: row.ingredients,
    advice: row.advice ?? '',
    missing: row.missing ?? '',
    praise: row.praise ?? '',
    imageUrl: row.image_url ?? undefined,
    feedback: (row.feedback as MealLog['feedback']) ?? null,
    date: row.date,
    time: row.time,
  };
}

// ============================================================
// Lifestyles
// ============================================================

export async function getLifestyle(userId: string): Promise<Lifestyle> {
  const { data } = await supabase
    .from('lifestyles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!data) return {};
  return lifestyleRowToLifestyle(data);
}

export async function upsertLifestyle(userId: string, lifestyle: Lifestyle): Promise<Lifestyle> {
  const { data, error } = await supabase
    .from('lifestyles')
    .upsert({
      user_id: userId,
      portion_size: lifestyle.portionSize ?? null,
      exercise_level: lifestyle.exerciseLevel ?? null,
      appetite: lifestyle.appetite ?? null,
      meal_frequency: lifestyle.mealFrequency ?? null,
      walk_minutes: lifestyle.walkMinutes ?? null,
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw new Error(`Upsert lifestyle failed: ${error.message}`);
  return lifestyleRowToLifestyle(data!);
}

function lifestyleRowToLifestyle(row: {
  portion_size: string | null;
  exercise_level: string | null;
  appetite: string | null;
  meal_frequency: string | null;
  walk_minutes: string | null;
}): Lifestyle {
  return {
    portionSize: row.portion_size ?? undefined,
    exerciseLevel: row.exercise_level ?? undefined,
    appetite: row.appetite ?? undefined,
    mealFrequency: row.meal_frequency ?? undefined,
    walkMinutes: row.walk_minutes ?? undefined,
  };
}

// ============================================================
// Health Data
// ============================================================

export async function getLatestHealthData(userId: string): Promise<HealthData> {
  const { data } = await supabase
    .from('health_data')
    .select('*')
    .eq('user_id', userId)
    .order('synced_at', { ascending: false })
    .limit(1)
    .single();

  if (!data) return { connected: false };

  return {
    connected: true,
    steps: data.steps ?? undefined,
    heartRate: data.heart_rate ?? undefined,
    weight: data.weight ?? undefined,
    bloodPressureSys: data.blood_pressure_sys ?? undefined,
    bloodPressureDia: data.blood_pressure_dia ?? undefined,
    sleepHours: data.sleep_hours ?? undefined,
    lastSynced: new Date(data.synced_at).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export async function insertHealthData(
  userId: string,
  healthData: Omit<HealthData, 'connected' | 'lastSynced'>
): Promise<HealthData> {
  const { data, error } = await supabase
    .from('health_data')
    .insert({
      user_id: userId,
      steps: healthData.steps ?? null,
      heart_rate: healthData.heartRate ?? null,
      weight: healthData.weight ?? null,
      blood_pressure_sys: healthData.bloodPressureSys ?? null,
      blood_pressure_dia: healthData.bloodPressureDia ?? null,
      sleep_hours: healthData.sleepHours ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(`Insert health data failed: ${error.message}`);
  return {
    connected: true,
    steps: data!.steps ?? undefined,
    heartRate: data!.heart_rate ?? undefined,
    weight: data!.weight ?? undefined,
    bloodPressureSys: data!.blood_pressure_sys ?? undefined,
    bloodPressureDia: data!.blood_pressure_dia ?? undefined,
    sleepHours: data!.sleep_hours ?? undefined,
    lastSynced: new Date(data!.synced_at).toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
