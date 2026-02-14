import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { tokens } from '@/theme/tokens';
import { MealAnalysis } from '@/types';
import { ScoreRing } from './ScoreRing';
import { NutrientBar } from './NutrientBar';
import { Card } from './Card';
import { ThumbUpIcon, ThumbDownIcon } from './Icons';
import { styles } from '@/theme/styles';

interface MealDetailViewProps {
  analysis: MealAnalysis;
  showFeedback?: boolean;
  onFeedback?: (type: 'good' | 'bad') => void;
}

export const MealDetailView: React.FC<MealDetailViewProps> = ({
  analysis,
  showFeedback,
  onFeedback,
}) => {
  const [fb, setFb] = useState<'good' | 'bad' | null>(null);
  const { name, cal, p, f, c, fiber, salt, score, ingredients, advice, missing, praise } =
    analysis;

  const doFb = (t: 'good' | 'bad') => {
    setFb(t);
    onFeedback?.(t);
  };

  return (
    <View style={{ padding: 16 }}>
      {praise && (
        <Card
          style={{
            backgroundColor: tokens.successLight,
            borderColor: '#a7d8b8',
            marginBottom: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: tokens.fontTitle, fontWeight: '800', color: tokens.success }}>
            {praise}
          </Text>
        </Card>
      )}

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 14 }}>
        <ScoreRing score={score} size={110} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: tokens.fontTitle,
              fontWeight: '800',
              color: tokens.text,
              marginBottom: 6,
            }}
          >
            {name}
          </Text>
          <Text style={{ fontSize: tokens.fontHero, fontWeight: '800', color: tokens.green }}>
            {cal} <Text style={{ fontSize: tokens.fontBody, fontWeight: '500' }}>kcal</Text>
          </Text>
        </View>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Text
          style={{
            fontSize: tokens.fontLarge,
            fontWeight: '800',
            color: tokens.green,
            marginBottom: 16,
          }}
        >
          栄養バランス
        </Text>
        <NutrientBar
          label="たんぱく質"
          value={p}
          max={60}
          color={tokens.success}
          status={p >= 20 ? 'good' : 'low'}
        />
        <NutrientBar
          label="あぶら（脂質）"
          value={f}
          max={65}
          color={tokens.orange}
          status={f <= 25 ? 'good' : 'low'}
        />
        <NutrientBar label="炭水化物" value={c} max={300} color="#3b82f6" status="good" />
        <NutrientBar
          label="食物繊維"
          value={fiber}
          max={20}
          color="#7c3aed"
          status={fiber >= 4 ? 'good' : 'low'}
        />
        <NutrientBar
          label="塩分"
          value={salt}
          max={7}
          color={tokens.danger}
          status={salt <= 3 ? 'good' : 'low'}
        />
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <Text
          style={{
            fontSize: tokens.fontLarge,
            fontWeight: '800',
            color: tokens.green,
            marginBottom: 12,
          }}
        >
          見つけた食材
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {ingredients.map((i) => (
            <View
              key={i}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: tokens.greenLight,
                borderRadius: 24,
              }}
            >
              <Text style={{ fontSize: tokens.fontBody, fontWeight: '600', color: tokens.green }}>{i}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card
        style={{
          backgroundColor: tokens.orangeLight,
          borderColor: '#f5d9b3',
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            fontSize: tokens.fontLarge,
            fontWeight: '800',
            color: tokens.orange,
            marginBottom: 8,
          }}
        >
          🤖 あなたへのアドバイス
        </Text>
        <Text
          style={{ fontSize: tokens.fontBody, color: tokens.text, lineHeight: 30, marginBottom: 10 }}
        >
          {advice}
        </Text>
        {missing ? (
          <Text style={{ fontSize: tokens.fontBody, color: tokens.danger, fontWeight: '700' }}>
            不足しています → {missing}
          </Text>
        ) : null}
      </Card>

      {showFeedback && (
        <Card style={{ marginBottom: 14, alignItems: 'center' }}>
          <Text style={{ fontSize: tokens.fontBody, fontWeight: '700', marginBottom: 14 }}>
            この結果は参考になりましたか？
          </Text>
          <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
            <TouchableOpacity
              onPress={() => doFb('good')}
              style={[
                styles.fbBtn,
                fb === 'good' && {
                  borderColor: tokens.success,
                  backgroundColor: tokens.successLight,
                },
              ]}
            >
              <ThumbUpIcon size={24} color={fb === 'good' ? tokens.success : tokens.textMuted} />
              <Text style={[styles.fbBtnText, fb === 'good' && { color: tokens.success }]}>良い</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => doFb('bad')}
              style={[
                styles.fbBtn,
                fb === 'bad' && {
                  borderColor: tokens.danger,
                  backgroundColor: tokens.dangerLight,
                },
              ]}
            >
              <ThumbDownIcon size={24} color={fb === 'bad' ? tokens.danger : tokens.textMuted} />
              <Text style={[styles.fbBtnText, fb === 'bad' && { color: tokens.danger }]}>ちがう</Text>
            </TouchableOpacity>
          </View>
          {fb && (
            <Text
              style={{
                fontSize: tokens.fontSub,
                color: tokens.success,
                marginTop: 10,
                fontWeight: '600',
              }}
            >
              ありがとうございます！
            </Text>
          )}
        </Card>
      )}
      <Text
        style={{
          fontSize: tokens.fontSmall,
          color: tokens.textMuted,
          textAlign: 'center',
          lineHeight: 22,
          marginBottom: 16,
        }}
      >
        ※本アドバイスはAIによる推測であり、{'\n'}医療診断ではありません
      </Text>
    </View>
  );
};
