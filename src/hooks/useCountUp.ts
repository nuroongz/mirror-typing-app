// 숫자 카운트업 애니메이션 훅
// - target 이 바뀌면 0 에서 target 까지 ease-out cubic 으로 진행
// - 결과 화면 등에서 큰 숫자 표시에 사용
import { useEffect, useState } from 'react';

export const useCountUp = (target: number, durationMs: number = 800): number => {
  const [value, setValue] = useState<number>(0);

  useEffect(() => {
    let frameId: number | null = null;
    let startTs: number | null = null;

    const step = (ts: number) => {
      if (startTs === null) startTs = ts;
      const elapsed = ts - startTs;
      const t = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [target, durationMs]);

  return value;
};
