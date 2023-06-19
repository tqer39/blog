import { ChangeThemeButton } from './ChangeThemeButton';

const ThemeSwitcher = () => {
  return (
    <div className="flex items-center justify-between">
      <span className="group inline-flex items-center text-xl font-medium pl-2 pr-3 py-2">
        <ChangeThemeButton />
      </span>
    </div>
  );
};

export default ThemeSwitcher;
