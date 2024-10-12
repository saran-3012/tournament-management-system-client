export default function sanitizeInput(inputValue, vulnerableCharacters) {
  if(!inputValue){
    return inputValue;
  }

  let sanitizedInput = "";
  for(const ch of inputValue){
    if(!vulnerableCharacters.contains(ch)){
      sanitizedInput += ch;
    }
  }
  return sanitizedInput;
};
