package com.comandadigital.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class CnpjValidator implements ConstraintValidator<ValidCnpj, String> {

    @Override
    public boolean isValid(String cnpj, ConstraintValidatorContext context) {
        if (cnpj == null || cnpj.isBlank()) return true;
        String digits = cnpj.replaceAll("[^0-9]", "");
        if (digits.length() != 14) return false;
        if (digits.chars().distinct().count() == 1) return false;
        int[] weights1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int sum = 0;
        for (int i = 0; i < 12; i++) sum += Character.getNumericValue(digits.charAt(i)) * weights1[i];
        int remainder = sum % 11;
        int digit1 = remainder < 2 ? 0 : 11 - remainder;
        if (Character.getNumericValue(digits.charAt(12)) != digit1) return false;
        int[] weights2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        sum = 0;
        for (int i = 0; i < 13; i++) sum += Character.getNumericValue(digits.charAt(i)) * weights2[i];
        remainder = sum % 11;
        int digit2 = remainder < 2 ? 0 : 11 - remainder;
        return Character.getNumericValue(digits.charAt(13)) == digit2;
    }

    public static String formatar(String cnpj) {
        if (cnpj == null) return null;
        String d = cnpj.replaceAll("[^0-9]", "");
        if (d.length() != 14) return cnpj;
        return String.format("%s.%s.%s/%s-%s",
            d.substring(0, 2), d.substring(2, 5), d.substring(5, 8),
            d.substring(8, 12), d.substring(12, 14));
    }
}
