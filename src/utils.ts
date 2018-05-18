export const log = (...args: any[]) => {
  const p = document.createElement("p");
  p.innerHTML = JSON.stringify(args);
  document.body.appendChild(p);
};
