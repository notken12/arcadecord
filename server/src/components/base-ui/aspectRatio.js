// aspectRatio.js - Arcadecord
//
// Copyright (C) 2022 Ken Zhou
//
// This file is part of Arcadecord.
//
// Arcadecord can not be copied and/or distributed
// without the express permission of Ken Zhou.

// mouse.js
import { ref, onMounted, onUnmounted } from 'vue';

// by convention, composable function names start with "use"
export function useAspectRatio(ratio, element) {
  // state encapsulated and managed by the composable
  const width = ref(0);
  const height = ref(0);

  // a composable can update its managed state over time.
  function update(event) {
    // shrink the element so the parent can resize
    element.value.style.width = `0px`;
    element.value.style.height = `0px`;

    requestAnimationFrame(() => {
      const parent = element.value.parentElement;

      var cs = getComputedStyle(parent);

      var paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      var paddingY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);

      var borderX =
        parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      var borderY =
        parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);

      // Element width and height minus padding and border
      const parentWidth = parent.offsetWidth - paddingX - borderX;
      const parentHeight = parent.offsetHeight - paddingY - borderY;
      const parentRatio = parentWidth / parentHeight;

      // return the largest possible width and height that fits the element's parent
      // while maintaining the aspect ratio

      if (typeof ratio === 'function') {
        let { width: _width, height: _height } = ratio(
          parentWidth,
          parentHeight
        );
        height.value = _height;
        width.value = _width;
      } else {
        if (parentRatio > ratio) {
          // parent is wider than the aspect ratio
          height.value = parentHeight;
          width.value = parentHeight * ratio;
        } else {
          // parent is taller than the aspect ratio
          width.value = parentWidth;
          height.value = parentWidth / ratio;
        }
      }

      // update the element's style
      element.value.style.width = `${width.value}px`;
      element.value.style.height = `${height.value}px`;
    });
  }

  // a composable can also hook into its owner component's
  // lifecycle to setup and teardown side effects.
  onMounted(() => {
    window.addEventListener('resize', update);
    update();
  });

  onUnmounted(() => window.removeEventListener('resize', update));

  // expose managed state as return value
  return { width, height };
}
