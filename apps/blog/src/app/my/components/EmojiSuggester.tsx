'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Common emojis with colon notation
export const EMOJI_MAP: Record<string, string> = {
  // Smileys & People
  smile: '😄',
  grinning: '😀',
  joy: '😂',
  rofl: '🤣',
  smiley: '😃',
  sweat_smile: '😅',
  laughing: '😆',
  wink: '😉',
  blush: '😊',
  yum: '😋',
  sunglasses: '😎',
  heart_eyes: '😍',
  kissing_heart: '💋',
  thinking: '🤔',
  neutral_face: '😐',
  expressionless: '😑',
  unamused: '😒',
  roll_eyes: '🙄',
  grimacing: '😬',
  lying_face: '🤥',
  relieved: '😌',
  pensive: '😔',
  sleepy: '😪',
  drooling_face: '🤤',
  sleeping: '😴',
  mask: '😷',
  nerd_face: '🤓',
  confused: '😕',
  worried: '😟',
  slightly_frowning_face: '🙁',
  frowning_face: '☹️',
  open_mouth: '😮',
  hushed: '😯',
  astonished: '😲',
  flushed: '😳',
  pleading_face: '🥺',
  frowning: '😦',
  anguished: '😧',
  fearful: '😨',
  cold_sweat: '😰',
  disappointed_relieved: '😥',
  cry: '😢',
  sob: '😭',
  scream: '😱',
  confounded: '😖',
  persevere: '😣',
  disappointed: '😞',
  sweat: '😓',
  weary: '😩',
  tired_face: '😫',
  yawning_face: '🥱',
  triumph: '😤',
  rage: '😡',
  angry: '😠',
  smiling_imp: '😈',
  skull: '💀',
  poop: '💩',
  clown_face: '🤡',
  ghost: '👻',
  alien: '👽',
  robot: '🤖',
  cat: '🐱',
  heart: '❤️',
  orange_heart: '🧡',
  yellow_heart: '💛',
  green_heart: '💚',
  blue_heart: '💙',
  purple_heart: '💜',
  broken_heart: '💔',
  fire: '🔥',
  sparkles: '✨',
  star: '⭐',
  star2: '🌟',
  zap: '⚡',
  boom: '💥',
  // Gestures
  thumbsup: '👍',
  thumbsdown: '👎',
  ok_hand: '👌',
  punch: '👊',
  fist: '✊',
  wave: '👋',
  clap: '👏',
  raised_hands: '🙌',
  pray: '🙏',
  muscle: '💪',
  point_up: '☝️',
  point_down: '👇',
  point_left: '👈',
  point_right: '👉',
  middle_finger: '🖕',
  hand: '✋',
  v: '✌️',
  metal: '🤘',
  call_me_hand: '🤙',
  // Objects & Symbols
  100: '💯',
  check: '✅',
  x: '❌',
  warning: '⚠️',
  question: '❓',
  exclamation: '❗',
  bulb: '💡',
  memo: '📝',
  pencil: '✏️',
  book: '📖',
  books: '📚',
  bookmark: '🔖',
  link: '🔗',
  paperclip: '📎',
  scissors: '✂️',
  file_folder: '📁',
  calendar: '📅',
  chart_with_upwards_trend: '📈',
  chart_with_downwards_trend: '📉',
  bar_chart: '📊',
  email: '📧',
  inbox_tray: '📥',
  outbox_tray: '📤',
  package: '📦',
  mailbox: '📫',
  bell: '🔔',
  loudspeaker: '📢',
  mega: '📣',
  mute: '🔇',
  speaker: '🔈',
  sound: '🔉',
  loud_sound: '🔊',
  key: '🔑',
  lock: '🔒',
  unlock: '🔓',
  hammer: '🔨',
  wrench: '🔧',
  gear: '⚙️',
  shield: '🛡️',
  gun: '🔫',
  bomb: '💣',
  hourglass: '⌛',
  watch: '⌚',
  clock: '🕐',
  // Nature & Weather
  sunny: '☀️',
  cloud: '☁️',
  rain: '🌧️',
  snow: '❄️',
  rainbow: '🌈',
  ocean: '🌊',
  mountain: '⛰️',
  earth: '🌍',
  moon: '🌙',
  sun: '🌞',
  // Food & Drink
  apple: '🍎',
  pizza: '🍕',
  hamburger: '🍔',
  fries: '🍟',
  hotdog: '🌭',
  sandwich: '🥪',
  taco: '🌮',
  burrito: '🌯',
  sushi: '🍣',
  ramen: '🍜',
  rice: '🍚',
  coffee: '☕',
  tea: '🍵',
  beer: '🍺',
  wine_glass: '🍷',
  cocktail: '🍸',
  cake: '🎂',
  cookie: '🍪',
  chocolate_bar: '🍫',
  candy: '🍬',
  ice_cream: '🍦',
  // Activities & Sports
  soccer: '⚽',
  basketball: '🏀',
  football: '🏈',
  baseball: '⚾',
  tennis: '🎾',
  volleyball: '🏐',
  golf: '⛳',
  trophy: '🏆',
  medal: '🏅',
  first_place: '🥇',
  second_place: '🥈',
  third_place: '🥉',
  video_game: '🎮',
  dart: '🎯',
  game_die: '🎲',
  // Tech & Coding
  computer: '💻',
  desktop: '🖥️',
  keyboard: '⌨️',
  mouse: '🖱️',
  cd: '💿',
  dvd: '📀',
  floppy_disk: '💾',
  phone: '📱',
  telephone: '📞',
  camera: '📷',
  video_camera: '📹',
  tv: '📺',
  radio: '📻',
  battery: '🔋',
  electric_plug: '🔌',
  bug: '🐛',
  rocket: '🚀',
  satellite: '🛰️',
  // Arrows & Misc
  arrow_up: '⬆️',
  arrow_down: '⬇️',
  arrow_left: '⬅️',
  arrow_right: '➡️',
  arrow_upper_right: '↗️',
  arrow_lower_right: '↘️',
  arrow_lower_left: '↙️',
  arrow_upper_left: '↖️',
  arrows_counterclockwise: '🔄',
  rewind: '⏪',
  fast_forward: '⏩',
  play: '▶️',
  pause: '⏸️',
  stop: '⏹️',
  record: '⏺️',
  plus: '➕',
  minus: '➖',
  divide: '➗',
  heavy_multiplication_x: '✖️',
  infinity: '♾️',
  copyright: '©️',
  registered: '®️',
  tm: '™️',
  // Japanese
  jp: '🇯🇵',
  sushi_jp: '🍣',
  bento: '🍱',
  rice_ball: '🍙',
  curry: '🍛',
  oden: '🍢',
  dango: '🍡',
  sake: '🍶',
  izakaya_lantern: '🏮',
  // Additional
  tada: '🎉',
  confetti_ball: '🎊',
  balloon: '🎈',
  gift: '🎁',
  ribbon: '🎀',
  art: '🎨',
  ticket: '🎫',
  clapper: '🎬',
  microphone: '🎤',
  headphones: '🎧',
  musical_note: '🎵',
  notes: '🎶',
  saxophone: '🎷',
  guitar: '🎸',
  violin: '🎻',
  drum: '🥁',
  piano: '🎹',
};

interface EmojiSuggesterProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

export function EmojiSuggester({
  textareaRef,
  value,
  onChange,
}: EmojiSuggesterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [colonStart, setColonStart] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return Object.entries(EMOJI_MAP)
      .filter(([name]) => name.includes(lowerQuery))
      .slice(0, 8);
  }, [query]);

  const insertEmoji = useCallback(
    (emoji: string) => {
      const textarea = textareaRef.current;
      if (!textarea || colonStart === -1) return;

      const cursorPos = textarea.selectionStart;
      const before = value.substring(0, colonStart);
      const after = value.substring(cursorPos);
      const newValue = before + emoji + after;

      onChange(newValue);
      setIsOpen(false);
      setQuery('');
      setColonStart(-1);

      // Focus and set cursor position
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd =
          colonStart + emoji.length;
        textarea.focus();
      });
    },
    [textareaRef, value, onChange, colonStart]
  );

  // Handle keyboard navigation and input detection
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleInput = () => {
      const cursorPos = textarea.selectionStart;
      const textBeforeCursor = value.substring(0, cursorPos);

      // Find the last colon that starts a potential emoji
      const colonIndex = textBeforeCursor.lastIndexOf(':');
      if (colonIndex === -1) {
        setIsOpen(false);
        setQuery('');
        setColonStart(-1);
        return;
      }

      // Check if there's a space or another colon between the colon and cursor
      const textAfterColon = textBeforeCursor.substring(colonIndex + 1);
      if (
        textAfterColon.includes(' ') ||
        textAfterColon.includes(':') ||
        textAfterColon.includes('\n')
      ) {
        setIsOpen(false);
        setQuery('');
        setColonStart(-1);
        return;
      }

      // Check if the colon is at the start or after a space/newline
      const charBeforeColon =
        colonIndex > 0 ? textBeforeCursor[colonIndex - 1] : ' ';
      if (charBeforeColon !== ' ' && charBeforeColon !== '\n') {
        setIsOpen(false);
        setQuery('');
        setColonStart(-1);
        return;
      }

      setColonStart(colonIndex);
      setQuery(textAfterColon);
      setSelectedIndex(0);

      if (textAfterColon.length > 0) {
        // Calculate position for the dropdown
        const rect = textarea.getBoundingClientRect();
        const lineHeight = Number.parseInt(
          window.getComputedStyle(textarea).lineHeight,
          10
        );
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        const scrollTop = textarea.scrollTop;

        setPosition({
          top: rect.top + currentLine * lineHeight - scrollTop + lineHeight,
          left: rect.left + 16,
        });
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + suggestions.length) % suggestions.length
        );
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = suggestions[selectedIndex];
        if (selected) {
          insertEmoji(selected[1]);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setQuery('');
        setColonStart(-1);
      }
    };

    // Use a short delay to get the updated value
    const handleInputWithDelay = () => {
      requestAnimationFrame(handleInput);
    };

    const handleBlur = () => {
      // Delay closing to allow click events on suggestions
      setTimeout(() => setIsOpen(false), 150);
    };

    textarea.addEventListener('input', handleInputWithDelay);
    textarea.addEventListener('keydown', handleKeyDown);
    textarea.addEventListener('blur', handleBlur);

    return () => {
      textarea.removeEventListener('input', handleInputWithDelay);
      textarea.removeEventListener('keydown', handleKeyDown);
      textarea.removeEventListener('blur', handleBlur);
    };
  }, [textareaRef, value, isOpen, suggestions, selectedIndex, insertEmoji]);

  // Re-evaluate when value changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const colonIndex = textBeforeCursor.lastIndexOf(':');

    if (colonIndex === -1 || colonStart === -1) {
      return;
    }

    const textAfterColon = textBeforeCursor.substring(colonIndex + 1);
    if (
      textAfterColon.includes(' ') ||
      textAfterColon.includes(':') ||
      textAfterColon.includes('\n')
    ) {
      setIsOpen(false);
      setQuery('');
      setColonStart(-1);
      return;
    }

    setQuery(textAfterColon);
  }, [value, textareaRef, colonStart]);

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-[60] overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
      style={{ top: position.top, left: position.left }}
    >
      <ul className="max-h-64 overflow-auto py-1">
        {suggestions.map(([name, emoji], index) => (
          <li key={name}>
            <button
              type="button"
              className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => insertEmoji(emoji)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-muted-foreground">:{name}:</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
