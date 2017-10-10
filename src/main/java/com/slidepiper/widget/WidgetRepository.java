package com.slidepiper.widget;

import com.slidepiper.model.entity.Document;
import com.slidepiper.model.entity.widget.Widget;
import org.springframework.data.repository.Repository;
import org.springframework.security.access.prepost.PreAuthorize;

public interface WidgetRepository extends Repository<Widget, Long> {
    @PreAuthorize("hasRole('ROLE_USER')")
    Widget findById(long id);

    Widget findByDocumentAndType(Document document, String type);

    @PreAuthorize("hasRole('ROLE_USER')")
    Widget save(Widget widget);
}