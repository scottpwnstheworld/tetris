const status = document.getElementById("status")
if (!(status instanceof HTMLParagraphElement)) {
  throw new Error("Missing #status")
}

status.textContent =
  "Dev preview — logic lives in src/ and tests/; canvas UI arrives in later slices."
