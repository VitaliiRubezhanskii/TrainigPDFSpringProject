package com.slidepiper.annotation;

import com.slidepiper.validator.EnumerationValidator;

import javax.validation.Constraint;
import javax.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

@Target(FIELD)
@Retention(RUNTIME)
@Constraint(validatedBy = EnumerationValidator.class)
@Documented
public @interface Enumeration {
    String message() default "{com.slidepiper.annotation.CheckCase.ViewerEventTypeAnnotation.message}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
    Class<? extends Enum<?>> value();
}
