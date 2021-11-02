"use strict";
Package("com.qcobjects.installer",[
  Class("Installer",Object,{
    promptEvent:null,
    beforeinstallprompt (e) {
      logger.debug("registering installer event");
      e.preventDefault();
      this.promptEvent = e;
      this.root.classList.add("available");
      return false;
    },
    installed () {
      logger.debug("app is already installed");
      this.promptEvent = null;
//         This fires after onbeforinstallprompt OR after manual add to homescreen.
      this.root.classList.remove("available");
    },
    _new_ ({root}) {
      this.root = root;
      window.addEventListener("beforeinstallprompt", this.beforeinstallprompt.bind(this),false);
      window.addEventListener("appinstalled", this.installed.bind(this),false);
  
      root.addEventListener("click", this.install.bind(this));
      root.addEventListener("touchend", this.install.bind(this));
  
      window.matchMedia("(display-mode: standalone)").addEventListener("change", (evt) => {
        let displayMode = "browser";
        if (evt.matches) {
          displayMode = "standalone";
        }
        NotificationComponent.success(`TWA in ${displayMode} Mode`);
      });
      global.set("installer", this);
    },
    install () {
      var root = this.root;
      logger.debug("installer actioned");
      var promptEvent = this.promptEvent;
      if (promptEvent) {
        logger.debug("prompt event");

        promptEvent.prompt();
        promptEvent.userChoice
          .then(function (choiceResult) {
            if (choiceResult.outcome === "accepted") {
              // The user actioned the prompt (good or bad).
              // good is handled in
              root.classList.remove("available");
            } else {
              logger.debug("User has chosen not to install the PWA");
            }
            promptEvent = null;
          })
          .catch(function (installError) {
            // Boo. update the UI.
            promptEvent = null;
            root.classList.remove("available");
            logger.warn(`Error during install:  ${installError.toString()}`);
          });
      } else {
        logger.debug("not asking for install");
      }
    }
  })
]);
