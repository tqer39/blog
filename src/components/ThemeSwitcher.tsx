import { ChangeThemeButton } from './ChangeThemeButton';

const ThemeSwitcher = () => {
  return (
    <div className="flex items-center justify-between">
      <span className="group inline-flex items-center py-2 pl-2 pr-3 text-xl font-medium">
        <ChangeThemeButton />
      </span>
    </div>
  );
};

export default ThemeSwitcher;
