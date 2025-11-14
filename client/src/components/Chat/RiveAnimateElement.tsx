import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { riveInputState, riveThinkingState } from '~/store/rive-inputs';

function RiveAnimateElement() {
  const STATE_MACHINE = 'State Machine 1';

  const { rive, RiveComponent } = useRive({
    src: '/assets/mascotNarxoz.riv',
    stateMachines: STATE_MACHINE,
    autoplay: true,
  });

  const wave = useStateMachineInput(rive, STATE_MACHINE, 'isWave');
  const stopWave = useStateMachineInput(rive, STATE_MACHINE, 'stopWave');

  const isRead = useStateMachineInput(rive, STATE_MACHINE, 'isRead');
  const stopRead = useStateMachineInput(rive, STATE_MACHINE, 'stopRead');

  const isThinking = useStateMachineInput(rive, STATE_MACHINE, 'isThinking');
  const stopThinking = useStateMachineInput(rive, STATE_MACHINE, 'stopThinking');

  const riveInput = useRecoilValue(riveInputState);
  const riveThinking = useRecoilValue(riveThinkingState);

  useEffect(() => {
    if (!rive || !wave || !stopWave) return;

    requestAnimationFrame(() => {
      wave.fire();
    });

    const timer = setTimeout(() => {
      stopWave.fire();
    }, 7000);

    return () => clearTimeout(timer);
  }, [rive, wave, stopWave]);

  useEffect(() => {
    if (!rive || !isRead || !stopRead) return;

    requestAnimationFrame(() => {
      riveInput.trim().length > 0 ? isRead.fire() : stopRead.fire();
    });
  }, [riveInput, isRead, stopRead]);

  useEffect(() => {
    if (!rive || !isThinking || !stopThinking) return;

    requestAnimationFrame(() => {
      riveThinking ? isThinking.fire() : stopThinking.fire();
    });
  }, [riveThinking, isThinking, stopThinking]);

  return (
    <div className="mascot-btn-wrapper absolute -right-0 bottom-5 z-50 ml-5 hidden size-fit 2xl:flex">
      <div className="mascot-wrapper size-40">
        <RiveComponent />
      </div>
    </div>
  );
}

export default RiveAnimateElement;
