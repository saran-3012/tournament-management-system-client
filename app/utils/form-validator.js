export default function formValidator(formData, validationConfig) {

  const validationErrors = {};
  let hasErrors = false;
  for(const [key, value] of formData.entries()){
    if(!validationConfig[key]) continue;

    validationConfig[key].some((condition) => {
      if (condition.required && !value) {
        validationErrors[key] = condition.message;
        return hasErrors = true;
      }
      if (condition.minLength && value && value.length < condition.minLength) {
        validationErrors[key] = condition.message;
        return hasErrors = true;
      }
      if (condition.maxLength && value && value.length > condition.maxLength) {
        validationErrors[key] = condition.message;
        return hasErrors = true;
      }
      if (condition.pattern && !condition.pattern.test(value)) {
        validationErrors[key] = condition.message;
        return hasErrors = true;
      }
      if (condition.validator && typeof condition.validator === 'function' && !condition.validator(value)){
        console.log(condition.validator, condition.validator(value))
        validationErrors[key] = condition.message;
        return hasErrors = true;
      }

    });
 
  }
  return [validationErrors, hasErrors];
};
