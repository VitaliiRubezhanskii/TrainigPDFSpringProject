package com.slidepiper.controller.dashboard;

import com.slidepiper.model.entity.Viewer;
import com.slidepiper.repository.ViewerRepository;
import com.slidepiper.service.dashboard.DashboardViewerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@RestController
@PreAuthorize("hasRole('ROLE_USER')")
public class DashboardViewerController {
    private final ViewerRepository viewerRepository;
    private final DashboardViewerService dashboardViewerService;

    @Autowired
    public DashboardViewerController(ViewerRepository viewerRepository,
                                     DashboardViewerService dashboardViewerService) {
        this.viewerRepository = viewerRepository;
        this.dashboardViewerService = dashboardViewerService;
    }

    /** @deprecated */
    @GetMapping("/api/v1/viewer")
    public Map<String, String> getNavigationBarConfiguration(Principal principal) {
        Viewer viewer = viewerRepository.findByEmail(principal.getName());

        Map<String, String> navigationBarConfiguration = new HashMap<>();
        navigationBarConfiguration.put("viewer_toolbar_background", viewer.getViewer_toolbar_background());
        navigationBarConfiguration.put("viewer_toolbar_cta_background", viewer.getViewer_toolbar_cta1_background());
        navigationBarConfiguration.put("viewer_toolbar_cta_text_color", viewer.getViewer_toolbar_cta1_color());
        navigationBarConfiguration.put("viewer_toolbar_logo_link", viewer.getViewer_toolbar_logo_link());
        navigationBarConfiguration.put("viewer_toolbar_text_color", viewer.getViewer_toolbar_color());
        navigationBarConfiguration.put("viewer_toolbar_cta1_is_enabled", viewer.getViewer_toolbar_cta1_is_enabled());
        navigationBarConfiguration.put("viewer_toolbar_cta1_link", viewer.getViewer_toolbar_cta1_link());
        navigationBarConfiguration.put("viewer_toolbar_cta1_text", viewer.getViewer_toolbar_cta1_text());
        navigationBarConfiguration.put("viewer_toolbar_cta2_is_enabled", viewer.getViewer_toolbar_cta2_is_enabled());
        navigationBarConfiguration.put("viewer_toolbar_cta2_link", viewer.getViewer_toolbar_cta2_link());
        navigationBarConfiguration.put("viewer_toolbar_cta2_text", viewer.getViewer_toolbar_cta2_text());
        navigationBarConfiguration.put("viewer_toolbar_cta3_is_enabled", viewer.getViewer_toolbar_cta3_is_enabled());
        navigationBarConfiguration.put("viewer_toolbar_cta3_link", viewer.getViewer_toolbar_cta3_link());
        navigationBarConfiguration.put("viewer_toolbar_cta3_text", viewer.getViewer_toolbar_cta3_text());

        navigationBarConfiguration.values().removeIf(Objects::isNull);
        return navigationBarConfiguration;
    }

    /** @deprecated */
    @PostMapping("/api/v1/viewer")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void saveNavigationBarConfiguration(Principal principal,
                                           @RequestBody @RequestParam(value = "viewer_toolbar_logo_image", required = false) MultipartFile viewerToolbarLogoImage,
                                           @RequestBody @RequestParam("viewer_toolbar_logo_link") String viewerToolbarLogoLink,
                                           @RequestBody @RequestParam("viewer_toolbar_background") String viewerToolbarBackground,
                                           @RequestBody @RequestParam("viewer_toolbar_text_color") String viewerToolbarTextColor,
                                           @RequestBody @RequestParam("viewer_toolbar_cta_background") String viewerToolbarCTABackground,
                                           @RequestBody @RequestParam("viewer_toolbar_cta_text_color") String viewerToolbarCTATextColor,
                                           @RequestBody @RequestParam("viewer_toolbar_cta1_is_enabled") String viewerToolbarCta1IsEnabled,
                                           @RequestBody @RequestParam("viewer_toolbar_cta1_link") String viewerToolbarCta1Link,
                                           @RequestBody @RequestParam("viewer_toolbar_cta1_text") String viewerToolbarCta1Text,
                                           @RequestBody @RequestParam("viewer_toolbar_cta2_is_enabled") String viewerToolbarCta2IsEnabled,
                                           @RequestBody @RequestParam("viewer_toolbar_cta2_link") String viewerToolbarCta2Link,
                                           @RequestBody @RequestParam("viewer_toolbar_cta2_text") String viewerToolbarCta2Text,
                                           @RequestBody @RequestParam("viewer_toolbar_cta3_is_enabled") String viewerToolbarCta3IsEnabled,
                                           @RequestBody @RequestParam("viewer_toolbar_cta3_link") String viewerToolbarCta3Link,
                                           @RequestBody @RequestParam("viewer_toolbar_cta3_text") String viewerToolbarCta3Text) throws IOException {

        Viewer viewer = viewerRepository.findByEmail(principal.getName());
        if (Objects.nonNull(viewerToolbarLogoImage)) {
            viewer.setLogo_image(dashboardViewerService.createLogoUrl(viewer, viewerToolbarLogoImage));
        }
        viewer.setViewer_toolbar_logo_link(viewerToolbarLogoLink);
        viewer.setViewer_toolbar_background(viewerToolbarBackground);
        viewer.setViewer_toolbar_color(viewerToolbarTextColor);
        viewer.setViewer_toolbar_cta1_background(viewerToolbarCTABackground);
        viewer.setViewer_toolbar_cta2_background(viewerToolbarCTABackground);
        viewer.setViewer_toolbar_cta3_background(viewerToolbarCTABackground);
        viewer.setViewer_toolbar_cta1_color(viewerToolbarCTATextColor);
        viewer.setViewer_toolbar_cta2_color(viewerToolbarCTATextColor);
        viewer.setViewer_toolbar_cta3_color(viewerToolbarCTATextColor);
        viewer.setViewer_toolbar_cta1_is_enabled(viewerToolbarCta1IsEnabled);
        viewer.setViewer_toolbar_cta1_link(viewerToolbarCta1Link);
        viewer.setViewer_toolbar_cta1_text(viewerToolbarCta1Text);
        viewer.setViewer_toolbar_cta2_is_enabled(viewerToolbarCta2IsEnabled);
        viewer.setViewer_toolbar_cta2_link(viewerToolbarCta2Link);
        viewer.setViewer_toolbar_cta2_text(viewerToolbarCta2Text);
        viewer.setViewer_toolbar_cta3_is_enabled(viewerToolbarCta3IsEnabled);
        viewer.setViewer_toolbar_cta3_link(viewerToolbarCta3Link);
        viewer.setViewer_toolbar_cta3_text(viewerToolbarCta3Text);

        viewerRepository.save(viewer);
    }
}