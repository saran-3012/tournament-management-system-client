export default function checkCharactersPresent(data, characters) {
  for(const ch of data){
    if(characters.contains(ch)){
        return true;
    }
  }
  return false;
};
