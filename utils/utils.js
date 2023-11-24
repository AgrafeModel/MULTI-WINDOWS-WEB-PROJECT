/**@
 * @brief This function is used to get the position and size of the window on the screen
 * @returns the position and size of the window
 */
function getPosSize() {
  //get the postion of the window on the screen
  var pos = {
    x: window.screenX,
    y: window.screenY,
  };
  //get the size of the window
  var size = {
    width: window.outerWidth,
    height: window.outerHeight,
  };
  //return the position and size
  return {
    pos: pos,
    size: size,
  };
}

/**
 * @brief This function is used to save the position and size of the window in the local storage
 * @param id the id of the window
 */
function savePosSize(id) {
  //get the window info
  const info = JSON.stringify({
    pos: getPosSize().pos,
    size: getPosSize().size,
    time: Date.now(),
  });
  //save the info in the local storage
  localStorage.setItem(id, info);
}

/**
 * @brief This function is used to check if a user is inactive for more than 5 seconds and remove him from the local storage
 */
function checkUserInactivity() {
  //get the window info
  var locals = localStorage;
  //for each user
  for (var key in locals) {
    try {
      if (key == id) {
        continue;
      }
      //if the user is inactive for more than 5 seconds
      if (Date.now() - JSON.parse(locals[key]).time > 5000) {
        //remove the user from the local storage
        localStorage.removeItem(key);
      }
    } catch (e) {}
  }
}

export { getPosSize, savePosSize, checkUserInactivity };
