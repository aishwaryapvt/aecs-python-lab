// Load homework assigned by teacher
export async function loadHomework(studentClass) {
  const homeworkKey = `homework-${studentClass}`;
  const homework = localStorage.getItem(homeworkKey);
  return homework;
}

// Assign new homework (for teacher dashboard use)
export function assignHomework(studentClass, homeworkText) {
  const homeworkKey = `homework-${studentClass}`;
  localStorage.setItem(homeworkKey, homeworkText);
}
