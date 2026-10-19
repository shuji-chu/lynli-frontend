import { $ } from "../core/utils.js";
import { renderLayout } from "../components/ui/layout.js";
import { ROUTES } from "../router/routes.js";
import { store } from "../store/data.js";
import { nav } from "../router/index.js";
export function initAuth() {
  $("#login-form").onsubmit = (e) => {
    e.preventDefault();
    $("#login-view").hidden = true; $("#app-view").hidden = false;
    renderLayout(ROUTES, { nickname: "管理员" });
    location.hash = "#/dashboard";
  };
}
