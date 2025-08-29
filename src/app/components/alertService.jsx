let alertify = null;

if (typeof window !== "undefined") {
  // Only load in the browser
  alertify = require("alertifyjs");
  require("alertifyjs/build/css/alertify.css");
  require("alertifyjs/build/css/themes/default.css");

  // Global settings
  alertify.set('notifier', 'position', 'top-right');
  alertify.set('notifier', 'delay', 3);
}

const AlertService = {
  success: (message) => {
    if (alertify) alertify.success(message);
  },
  error: (message) => {
    if (alertify) alertify.error(message);
  },
  warning: (message) => {
    if (alertify) alertify.warning(message);
  },
  message: (message) => {
    if (alertify) alertify.message(message);
  },
  confirm: (title, message, onOk, onCancel) => {
    if (alertify) alertify.confirm(title, message, onOk, onCancel);
  },
  prompt: (title, message, onOk, onCancel) => {
    if (alertify) alertify.prompt(title, message, onOk, onCancel);
  }
};

export default AlertService;
