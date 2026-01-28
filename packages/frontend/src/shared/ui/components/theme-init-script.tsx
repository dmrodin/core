export function ThemeInitScript() {
    const code = `(function(){try{var e=function(){try{return localStorage.getItem("theme")}catch(t){return null}}();var n=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var r=e==="dark"||e==="system"&&n||!e&&n?"dark":"light";var d=document.documentElement;d.classList.remove("light","dark");d.classList.add(r);d.style.colorScheme=r;}catch(_){}})();`;
    return <script id="theme-init" dangerouslySetInnerHTML={{ __html: code }} />;
}
