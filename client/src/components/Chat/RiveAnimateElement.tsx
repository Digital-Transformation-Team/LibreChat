import { useRive } from '@rive-app/react-canvas';

function RiveAnimateElement() {
  const STATE_MACHINE = 'State Machine 1';

  const { RiveComponent } = useRive({
    src: '/assets/mascotNaxoz.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  return (
    <div className="mascot-btn-wrapper absolute bottom-8 right-8 z-50 size-fit">
      <div className="mascot-wrapper size-44">
        <RiveComponent />
      </div>
    </div>
  );
}

export default RiveAnimateElement;
