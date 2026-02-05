'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/i18n';
import { EMOJI_MAP } from './EmojiSuggester';

// Type for emoji category
interface EmojiCategory {
  labelKey: string;
  icon: string;
  keys: string[];
}

// Emoji categories with their keys from EMOJI_MAP
const EMOJI_CATEGORIES: Record<string, EmojiCategory> = {
  smileys: {
    labelKey: 'smileys' as const,
    icon: '😀',
    keys: [
      'smile',
      'grinning',
      'joy',
      'rofl',
      'smiley',
      'sweat_smile',
      'laughing',
      'wink',
      'blush',
      'yum',
      'sunglasses',
      'heart_eyes',
      'kissing_heart',
      'thinking',
      'neutral_face',
      'expressionless',
      'unamused',
      'roll_eyes',
      'grimacing',
      'lying_face',
      'relieved',
      'pensive',
      'sleepy',
      'drooling_face',
      'sleeping',
      'mask',
      'nerd_face',
      'confused',
      'worried',
      'slightly_frowning_face',
      'frowning_face',
      'open_mouth',
      'hushed',
      'astonished',
      'flushed',
      'pleading_face',
      'frowning',
      'anguished',
      'fearful',
      'cold_sweat',
      'disappointed_relieved',
      'cry',
      'sob',
      'scream',
      'confounded',
      'persevere',
      'disappointed',
      'sweat',
      'weary',
      'tired_face',
      'yawning_face',
      'triumph',
      'rage',
      'angry',
      'smiling_imp',
      'skull',
      'poop',
      'clown_face',
      'ghost',
      'alien',
      'robot',
      'cat',
    ],
  },
  gestures: {
    labelKey: 'gestures' as const,
    icon: '👍',
    keys: [
      'thumbsup',
      'thumbsdown',
      'ok_hand',
      'punch',
      'fist',
      'wave',
      'clap',
      'raised_hands',
      'pray',
      'muscle',
      'point_up',
      'point_down',
      'point_left',
      'point_right',
      'middle_finger',
      'hand',
      'v',
      'metal',
      'call_me_hand',
    ],
  },
  symbols: {
    labelKey: 'symbols' as const,
    icon: '❤️',
    keys: [
      'heart',
      'orange_heart',
      'yellow_heart',
      'green_heart',
      'blue_heart',
      'purple_heart',
      'broken_heart',
      'fire',
      'sparkles',
      'star',
      'star2',
      'zap',
      'boom',
      '100',
      'check',
      'x',
      'warning',
      'question',
      'exclamation',
      'bulb',
      'memo',
      'pencil',
      'book',
      'books',
      'bookmark',
      'link',
      'paperclip',
      'scissors',
      'file_folder',
      'calendar',
      'chart_with_upwards_trend',
      'chart_with_downwards_trend',
      'bar_chart',
      'email',
      'inbox_tray',
      'outbox_tray',
      'package',
      'mailbox',
      'bell',
      'loudspeaker',
      'mega',
      'mute',
      'speaker',
      'sound',
      'loud_sound',
      'key',
      'lock',
      'unlock',
      'hammer',
      'wrench',
      'gear',
      'shield',
      'gun',
      'bomb',
      'hourglass',
      'watch',
      'clock',
      'arrow_up',
      'arrow_down',
      'arrow_left',
      'arrow_right',
      'arrow_upper_right',
      'arrow_lower_right',
      'arrow_lower_left',
      'arrow_upper_left',
      'arrows_counterclockwise',
      'rewind',
      'fast_forward',
      'play',
      'pause',
      'stop',
      'record',
      'plus',
      'minus',
      'divide',
      'heavy_multiplication_x',
      'infinity',
      'copyright',
      'registered',
      'tm',
    ],
  },
  food: {
    labelKey: 'food' as const,
    icon: '🍕',
    keys: [
      'apple',
      'pizza',
      'hamburger',
      'fries',
      'hotdog',
      'sandwich',
      'taco',
      'burrito',
      'sushi',
      'ramen',
      'rice',
      'coffee',
      'tea',
      'beer',
      'wine_glass',
      'cocktail',
      'cake',
      'cookie',
      'chocolate_bar',
      'candy',
      'ice_cream',
      'sushi_jp',
      'bento',
      'rice_ball',
      'curry',
      'oden',
      'dango',
      'sake',
    ],
  },
  activities: {
    labelKey: 'activities' as const,
    icon: '⚽',
    keys: [
      'soccer',
      'basketball',
      'football',
      'baseball',
      'tennis',
      'volleyball',
      'golf',
      'trophy',
      'medal',
      'first_place',
      'second_place',
      'third_place',
      'video_game',
      'dart',
      'game_die',
      'tada',
      'confetti_ball',
      'balloon',
      'gift',
      'ribbon',
      'art',
      'ticket',
      'clapper',
      'microphone',
      'headphones',
      'musical_note',
      'notes',
      'saxophone',
      'guitar',
      'violin',
      'drum',
      'piano',
    ],
  },
  tech: {
    labelKey: 'tech' as const,
    icon: '💻',
    keys: [
      'computer',
      'desktop',
      'keyboard',
      'mouse',
      'cd',
      'dvd',
      'floppy_disk',
      'phone',
      'telephone',
      'camera',
      'video_camera',
      'tv',
      'radio',
      'battery',
      'electric_plug',
      'bug',
      'rocket',
      'satellite',
    ],
  },
  nature: {
    labelKey: 'nature' as const,
    icon: '🌈',
    keys: [
      'sunny',
      'cloud',
      'rain',
      'snow',
      'rainbow',
      'ocean',
      'mountain',
      'earth',
      'moon',
      'sun',
      'izakaya_lantern',
      'jp',
    ],
  },
};

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const { messages } = useI18n();
  const t = messages.editor.emojiPicker;
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter emojis based on search
  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return EMOJI_CATEGORIES;
    }

    const lowerSearch = search.toLowerCase();
    const result: Record<string, EmojiCategory> = {};

    for (const [categoryKey, category] of Object.entries(EMOJI_CATEGORIES)) {
      const filteredKeys = category.keys.filter(
        (key) => key.includes(lowerSearch) || EMOJI_MAP[key]?.includes(search)
      );

      if (filteredKeys.length > 0) {
        result[categoryKey] = {
          ...category,
          keys: filteredKeys,
        };
      }
    }

    return result;
  }, [search]);

  const categoryLabels: Record<string, string> = {
    smileys: t.smileys,
    gestures: t.gestures,
    symbols: t.symbols,
    food: t.food,
    activities: t.activities,
    tech: t.tech,
    nature: t.nature,
  };

  const hasResults = Object.keys(filteredCategories).length > 0;

  return (
    <div className="w-72">
      {/* Search input */}
      <div className="border-b p-2">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Emoji grid */}
      <div className="max-h-64 overflow-y-auto p-2">
        {hasResults ? (
          Object.entries(filteredCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <span>{category.icon}</span>
                <span>{categoryLabels[categoryKey]}</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5">
                {category.keys.map((key) => {
                  const emoji = EMOJI_MAP[key];
                  if (!emoji) return null;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onSelect(emoji)}
                      className="flex h-7 w-7 items-center justify-center rounded text-lg transition-colors hover:bg-accent"
                      title={`:${key}:`}
                    >
                      {emoji}
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {t.noResults}
          </div>
        )}
      </div>
    </div>
  );
}
