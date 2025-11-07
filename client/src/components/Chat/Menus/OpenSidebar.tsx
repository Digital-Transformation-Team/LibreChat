import { TooltipAnchor, Button, Sidebar } from '@librechat/client';
import { useLocalize } from '~/hooks';

export default function OpenSidebar({
  setNavVisible, navVisible
}: {
  setNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
  navVisible: boolean;
}) {
  const localize = useLocalize();
  return (
    <TooltipAnchor
      description={localize('com_nav_open_sidebar')}
      render={
        <Button
          size="icon"
          variant="outline"
          data-testid="open-sidebar-button"
          aria-label={localize('com_nav_open_sidebar')}
          className={`rounded-xl border border-border-light bg-surface-secondary p-2 hover:bg-surface-hover max-md:hidden
            ${
              !navVisible
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none opacity-0 hidden transition-all duration-300'
            }`
          }
          onClick={() =>
            setNavVisible((prev) => {
              localStorage.setItem('navVisible', JSON.stringify(!prev));
              return !prev;
            })
          }
        >
          <Sidebar />
        </Button>
      }
    />
  );
}
