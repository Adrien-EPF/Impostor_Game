/* @ds-bundle: {"namespace":"Imposteur","components":[{"name":"Button","sourcePath":"components/actions/Button/Button.jsx"},{"name":"RoleReveal","sourcePath":"components/jeu/RoleReveal/RoleReveal.jsx"},{"name":"SecretCard","sourcePath":"components/jeu/SecretCard/SecretCard.jsx"}],"sourceHashes":{"components/actions/Button/Button.jsx":"43639c2037f1","components/actions/Button/Button.d.ts":"3df5c440d7c5","components/actions/Button/Button.prompt.md":"b4cec629d420","components/jeu/RoleReveal/RoleReveal.jsx":"e1c240a85b12","components/jeu/RoleReveal/RoleReveal.d.ts":"9acb7f05cf98","components/jeu/RoleReveal/RoleReveal.prompt.md":"b1ac0b4f018b","components/jeu/SecretCard/SecretCard.jsx":"b9a9810f71b6","components/jeu/SecretCard/SecretCard.d.ts":"33d14ad192a5","components/jeu/SecretCard/SecretCard.prompt.md":"f6396d3698b7"},"inlinedExternals":[],"builtBy":"cc-design-sync"} */
"use strict";
var Imposteur = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // <define:import.meta.env>
  var init_define_import_meta_env = __esm({
    "<define:import.meta.env>"() {
    }
  });

  // shim:react-shim
  var require_react_shim = __commonJS({
    "shim:react-shim"(exports, module) {
      init_define_import_meta_env();
      var R = window.React;
      function np(p, k) {
        var o = {};
        for (var x in p) if (x !== "children") o[x] = p[x];
        if (k !== void 0) o.key = k;
        return o;
      }
      function jsx5(t, p, k) {
        var c = p && p.children;
        return c === void 0 ? R.createElement(t, np(p, k)) : R.createElement(t, np(p, k), c);
      }
      function jsxs4(t, p, k) {
        return R.createElement.apply(R, [t, np(p, k)].concat(p.children));
      }
      module.exports = R;
      module.exports.jsx = jsx5;
      module.exports.jsxs = jsxs4;
      module.exports.jsxDEV = function(t, p, k, s) {
        return (s ? jsxs4 : jsx5)(t, p, k);
      };
      module.exports.Fragment = R.Fragment;
    }
  });

  // dist/index.js
  var index_exports = {};
  __export(index_exports, {
    Button: () => Button,
    RoleReveal: () => RoleReveal,
    SecretCard: () => SecretCard
  });
  init_define_import_meta_env();
  var React = __toESM(require_react_shim(), 1);
  var import_jsx_runtime = __toESM(require_react_shim(), 1);
  var React2 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime2 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime3 = __toESM(require_react_shim(), 1);
  var import_jsx_runtime4 = __toESM(require_react_shim(), 1);
  var Button = React.forwardRef(
    function Button2({ variant = "primary", type = "button", ...rest }, ref) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          ref,
          type,
          className: `btn btn--${variant}`,
          ...rest
        }
      );
    }
  );
  function SecretCard({
    playerName,
    word,
    onReveal,
    onMemorized
  }) {
    const [open, setOpen] = React2.useState(false);
    const wordRef = React2.useRef(null);
    const isMrWhite = !word;
    React2.useLayoutEffect(() => {
      const el = wordRef.current;
      if (!open || !el) return;
      let size = 56;
      el.style.fontSize = size + "px";
      el.style.lineHeight = size + 4 + "px";
      while (el.scrollWidth > el.clientWidth && size > 28) {
        size -= 2;
        el.style.fontSize = size + "px";
        el.style.lineHeight = size + 4 + "px";
      }
    }, [open, word]);
    function handleClick() {
      if (open) {
        setOpen(false);
        onMemorized?.();
      } else {
        setOpen(true);
        onReveal?.();
      }
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "secret-card", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("p", { className: "secret-card__hint", children: [
        "Passe le t\xE9l\xE9phone \xE0 ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("b", { children: playerName }),
        ". Les autres, on regarde ailleurs \u{1F440}"
      ] }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "secret-card__scene", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(
        "div",
        {
          className: `secret-card__card${open ? " secret-card__card--open" : ""}`,
          children: [
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "secret-card__face secret-card__face--back", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("span", { children: "?" }) }),
            /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
              "div",
              {
                className: "secret-card__face secret-card__face--front",
                "aria-live": "polite",
                children: open && (isMrWhite ? /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
                  "strong",
                  {
                    className: "secret-card__word",
                    style: { fontSize: 40, lineHeight: "44px" },
                    children: "Tu es Mr. White"
                  }
                ) : /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "Ton mot" }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { className: "secret-card__word", ref: wordRef, children: word }),
                  /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("small", { children: "Chut." })
                ] }))
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        Button,
        {
          variant: open ? "secondary" : "primary",
          onClick: handleClick,
          children: open ? "J'ai m\xE9moris\xE9" : "Afficher mon mot"
        }
      )
    ] });
  }
  function CivilIcon(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { viewBox: "0 0 24 24", width: "52", height: "52", "aria-hidden": "true", ...props, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("g", { fill: "currentColor", children: [
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("circle", { cx: "12", cy: "7.5", r: "4.5" }),
      /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("path", { d: "M3.5 20c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5c0 .8-.7 1.5-1.5 1.5H5c-.8 0-1.5-.7-1.5-1.5z" })
    ] }) });
  }
  function ImposteurIcon(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { viewBox: "0 0 24 24", width: "52", height: "52", "aria-hidden": "true", ...props, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "path",
      {
        fill: "currentColor",
        fillRule: "evenodd",
        d: "M1.5 10C1.5 7.2 3.7 5.5 6.5 5.5c2.2 0 3.6 1 5.5 1s3.3-1 5.5-1c2.8 0 5 1.7 5 4.5 0 4.3-2.7 8-6 8-2 0-3-1.6-4.5-1.6S9.5 18 7.5 18c-3.3 0-6-3.7-6-8zM5 10.8a2.5 1.8 0 1 0 5 0a2.5 1.8 0 1 0-5 0zm9 0a2.5 1.8 0 1 0 5 0a2.5 1.8 0 1 0-5 0z"
      }
    ) });
  }
  function MrWhiteIcon(props) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("svg", { viewBox: "0 0 24 24", width: "52", height: "52", "aria-hidden": "true", ...props, children: /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
      "path",
      {
        fill: "currentColor",
        fillRule: "evenodd",
        d: "M12 2c-4.4 0-7.5 3.4-7.5 7.8v10.1c0 .9 1 1.4 1.7.8l1.3-1.1 1.6 1.4c.5.4 1.2.4 1.6 0l1.3-1.1 1.3 1.1c.4.4 1.1.4 1.6 0l1.6-1.4 1.3 1.1c.7.6 1.7.1 1.7-.8V9.8C19.5 5.4 16.4 2 12 2zM7.9 10a1.4 1.6 0 1 0 2.8 0a1.4 1.6 0 1 0-2.8 0zm5.4 0a1.4 1.6 0 1 0 2.8 0a1.4 1.6 0 1 0-2.8 0z"
      }
    ) });
  }
  var ROLE_LABEL = {
    civil: "Civil",
    imposteur: "Imposteur",
    "mr-white": "Mr. White"
  };
  var ROLE_ICON = {
    civil: CivilIcon,
    imposteur: ImposteurIcon,
    "mr-white": MrWhiteIcon
  };
  function RoleReveal({ playerName, role, animate = true }) {
    const Icon = ROLE_ICON[role];
    return /* @__PURE__ */ (0, import_jsx_runtime4.jsxs)("div", { className: `role-tile role-tile--${role}${animate ? " role-tile--animated" : ""}`, children: [
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "role-tile__disc", children: /* @__PURE__ */ (0, import_jsx_runtime4.jsx)(Icon, {}) }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("div", { className: "role-tile__name", children: playerName }),
      /* @__PURE__ */ (0, import_jsx_runtime4.jsx)("span", { className: "role-tile__badge", children: ROLE_LABEL[role] })
    ] });
  }
  return __toCommonJS(index_exports);
})();
window.Imposteur=Imposteur.__dsMainNs?Object.assign({},Imposteur,Imposteur.__dsMainNs,{__dsMainNs:undefined}):Imposteur;
