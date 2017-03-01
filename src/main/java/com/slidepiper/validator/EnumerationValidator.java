package com.slidepiper.validator;

import com.slidepiper.annotation.Enumeration;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

public class EnumerationValidator implements ConstraintValidator<Enumeration, String> {
    private Set<String> elements;

    @Override
    public void initialize(Enumeration enumeration) {
        this.elements = new HashSet<>();

        Enum<?>[] enumElements = enumeration.value().getEnumConstants();
        for (Enum<?> enumElement: enumElements) {
            this.elements.add(enumElement.name());
        }
    }

    @Override
    public boolean isValid(String element, ConstraintValidatorContext constraintValidatorContext) {
        return Objects.isNull(element) || elements.contains(element);
    }
}
