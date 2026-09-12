import {
  HeartPulse,
  Brain,
  Footprints,
  HandHeart,
  UtensilsCrossed,
  Home,
  type LucideIcon,
} from 'lucide-react';
import type {
  HealthTest,
  HealthTestQuestion,
  HealthTestQuestionOption,
} from './types';
import type {
  AssessmentForm,
  Question,
  Option,
} from '@/types/assessment';

export const ICON_NAME_MAP: Record<string, LucideIcon> = {
  HeartPulse,
  Brain,
  Footprints,
  HandHeart,
  UtensilsCrossed,
  Home,
};

function parseLayoutJson(layoutJson?: string): Record<string, unknown> {
  if (!layoutJson) return {};
  try {
    const parsed = JSON.parse(layoutJson);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}

function mapQuestions(questions: Question[], formId: number): HealthTestQuestion[] {
  if (!Array.isArray(questions)) return [];
  return questions.map(q => {
    const options: HealthTestQuestionOption[] = Array.isArray(q.options)
      ? q.options.map((o: Option) => ({
          id: o.id != null ? String(o.id) : `o-${Math.random().toString(36).slice(2, 8)}`,
          label: o.text ?? '',
          score: typeof o.value === 'number' ? o.value : 0,
          order: typeof o.order === 'number' ? o.order : 0,
        }))
      : [];

    const id = q.questionKey
      ? String(q.questionKey)
      : `q-${formId}-${q.questionId}`;

    return {
      id,
      text: q.question ?? '',
      description: q.description,
      categoryTag: Array.isArray(q.tags) && q.tags.length > 0 ? q.tags[0] : undefined,
      options,
    };
  });
}

export function mapAssessmentFormToHealthTest(form: AssessmentForm): HealthTest {
  const layout = parseLayoutJson(form.layoutJson);
  const healthTest =
    layout.healthTest && typeof layout.healthTest === 'object'
      ? (layout.healthTest as Record<string, unknown>)
      : {};

  const iconName = typeof healthTest.iconName === 'string' ? healthTest.iconName : 'HeartPulse';
  const icon = ICON_NAME_MAP[iconName] ?? HeartPulse;

  const questions = mapQuestions(form.questions ?? [], form.id);

  const recommendations =
    healthTest.recommendations && typeof healthTest.recommendations === 'object'
      ? (healthTest.recommendations as HealthTest['recommendations'])
      : {
          low: {
            level: 'low' as const,
            title: '',
            description: '',
          },
          medium: {
            level: 'medium' as const,
            title: '',
            description: '',
          },
          high: {
            level: 'high' as const,
            title: '',
            description: '',
          },
        };

  const scoring =
    healthTest.scoring && typeof healthTest.scoring === 'object'
      ? (healthTest.scoring as HealthTest['scoring'])
      : { thresholds: { low: 49, mid: 74 } };

  return {
    id: String(form.code ?? form.id),
    slug:
      typeof healthTest.slug === 'string' && healthTest.slug
        ? healthTest.slug
        : String(form.code ?? form.id),
    title: form.title ?? '',
    metaTitle:
      typeof healthTest.metaTitle === 'string' && healthTest.metaTitle
        ? healthTest.metaTitle
        : form.introTitle ?? form.title,
    metaDescription:
      typeof healthTest.metaDescription === 'string' && healthTest.metaDescription
        ? healthTest.metaDescription
        : form.introDescription ?? form.description,
    metaKeywords: Array.isArray(healthTest.metaKeywords)
      ? (healthTest.metaKeywords as string[])
      : [],
    shortDescription: form.description ?? '',
    durationMinutes:
      typeof form.estimatedDurationMinutes === 'number' ? form.estimatedDurationMinutes : 5,
    icon,
    accentGradientFrom:
      typeof healthTest.accentGradientFrom === 'string' ? healthTest.accentGradientFrom : undefined,
    accentGradientTo:
      typeof healthTest.accentGradientTo === 'string' ? healthTest.accentGradientTo : undefined,
    categories: Array.isArray(healthTest.categories)
      ? (healthTest.categories as string[])
      : [],
    featured: typeof healthTest.featured === 'boolean' ? healthTest.featured : false,
    stages: Array.isArray(healthTest.stages) ? (healthTest.stages as HealthTest['stages']) : [],
    questions,
    scoring,
    recommendations,
    relatedLinks: Array.isArray(healthTest.relatedLinks)
      ? (healthTest.relatedLinks as HealthTest['relatedLinks'])
      : [],
    faqs: Array.isArray(healthTest.faqs) ? (healthTest.faqs as HealthTest['faqs']) : [],
  };
}
