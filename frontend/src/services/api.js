

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

export async function getHealth() {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) throw new Error("Could not reach MedQueue backend");
  return response.json();
}

export async function getDoctors() {
  const response = await fetch(`${API_BASE}/doctors`);
  if (!response.ok) throw new Error("Could not load doctors");
  return response.json();
}

export async function getHomeDoctors() {
  const response = await fetch(`${API_BASE}/doctors/home/random`);
  if (!response.ok) throw new Error("Could not load doctors");
  return response.json();
}