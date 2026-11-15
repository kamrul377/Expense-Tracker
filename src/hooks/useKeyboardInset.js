import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

// Lifts a view above the keyboard.
// Newer Android builds are "edge-to-edge": the system no longer shrinks the screen when the keyboard opens,
// so inputs near the bottom (and centered modals) get hidden. This measures the overlap itself and works
// in every mode (Expo Go, APK, iOS) without adding a double gap.
//
// usage:
//   const ref = useRef(null);
//   const { inset, onLayout } = useKeyboardInset(ref);
//   <View ref={ref} collapsable={false} onLayout={onLayout} style={{ flex: 1, paddingBottom: inset }} />
export function useKeyboardInset(rootRef) {
  const [inset, setInset] = useState(0);
  const kbTop = useRef(null);
  const timer = useRef(null);

  const recalc = useCallback(() => {
    if (kbTop.current == null) return;
    rootRef.current?.measureInWindow((x, y, w, h) => {
      const overlap = y + h - kbTop.current;
      setInset(overlap > 1 ? Math.round(overlap) : 0);
    });
  }, [rootRef]);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      kbTop.current = e.endCoordinates.screenY;
      clearTimeout(timer.current);
      timer.current = setTimeout(recalc, Platform.OS === 'ios' ? 0 : 80);
    };
    const onHide = () => {
      kbTop.current = null;
      clearTimeout(timer.current);
      setInset(0);
    };

    const a = Keyboard.addListener(showEvt, onShow);
    const b = Keyboard.addListener(hideEvt, onHide);
    return () => {
      clearTimeout(timer.current);
      a.remove();
      b.remove();
    };
  }, [recalc]);

  return { inset, onLayout: recalc };
}

export default useKeyboardInset;