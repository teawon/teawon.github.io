const defaultTheme = [...document.styleSheets].find((style) =>
  /(main.css)$/.test(style.href)
);
const darkTheme = [...document.styleSheets].find((style) =>
  /(main_dark.css)$/.test(style.href)
);

const toggleThemeBtn = document.getElementById("toggle-theme");

const toLight = () => {
  toggleThemeBtn.innerHTML = `<i class="fa fa-solid fa-sun"></i>`;
  defaultTheme.disabled = false;
  darkTheme.disabled = true;

  if (window["customUtterances"]) {
    const customUtterances = window["customUtterances"];
    customUtterances.onChange(customUtterances.darkTheme);
  }

  localStorage.setItem("theme", "default");
};

const toDark = () => {
  toggleThemeBtn.innerHTML = `<i class="fa fa-solid fa-moon"></i>`;
  defaultTheme.disabled = true;
  darkTheme.disabled = false;

  if (window["customUtterances"]) {
    const customUtterances = window["customUtterances"];
    customUtterances.onChange(customUtterances.theme);
  }

  localStorage.setItem("theme", "dark");
};

const currentTheme = () => localStorage.getItem("theme");

const setDarkMode = (isDark) => {
  if (isDark) {
    toLight();
  } else {
    toDark();
  }
};

if (darkTheme) {
  let isDarkMode = false;
  if (currentTheme() === "dark") {
    isDarkMode = true;
  } else if (currentTheme() === "default") {
    isDarkMode = false;
  } else {
    isDarkMode = matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (toggleThemeBtn) {
    if (isDarkMode) {
      toDark();
    } else {
      toLight();
    }
  }

  const changeTheme = () => {
    setDarkMode(currentTheme() === "dark");
  };

  toggleThemeBtn.addEventListener("click", changeTheme);
}
