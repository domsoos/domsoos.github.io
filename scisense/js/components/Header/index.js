import { Header } from "./header"

document.addEventListener('DOMContentLoaded', () => {
  // Insert the header at the top of the body
  const app = document.getElementById('header'); // Or any specific element where you want the header
  app.insertAdjacentHTML('afterbegin', Header());
});
