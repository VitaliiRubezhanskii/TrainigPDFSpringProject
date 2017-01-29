package com.slidepiper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletRegistrationBean;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.context.annotation.Bean;
import org.springframework.web.filter.HiddenHttpMethodFilter;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

import slidepiper.config.ConfigPropertiesServlt;
import slidepiper.config.ConfigViewerServlt;
import slidepiper.customer_servlets.CustomerLoggingServlet;
import slidepiper.customer_servlets.DownloadSlidesServlet;
import slidepiper.customer_servlets.FileViewerServlet;
import slidepiper.customer_servlets.DocumentShareServlet;
import slidepiper.customer_servlets.GetMessageDataServlet;
import slidepiper.integration.HubSpot;
import slidepiper.keepalive.KeepAliveServlet;
import slidepiper.salesman_servlets.CreateUser;
import slidepiper.salesman_servlets.CustomizeToolbar;
import slidepiper.salesman_servlets.DownloadFileLinksServlt;
import slidepiper.salesman_servlets.ManagementServlet;
import slidepiper.salesman_servlets.ReportsServlet;
import slidepiper.salesman_servlets.SalesmanLoggingServlet;
import slidepiper.salesman_servlets.UploadCustomers;
import slidepiper.salesman_servlets.UploadFile;

@SpringBootApplication
public class Application extends SpringBootServletInitializer {

  @Override
  protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
    return application.sources(Application.class);
  }

  public static void main(String[] args) throws Exception {
    SpringApplication.run(Application.class, args);
  }
  
  
  /* Servlet Configuration */
  
  // This setting is to enable passing GET query parameters and POST data to the Servlet.
  @Bean
  public FilterRegistrationBean disableHiddenHttpMethodFilter(HiddenHttpMethodFilter filter) {
    FilterRegistrationBean filterRegistrationBean = new FilterRegistrationBean(filter);
    filterRegistrationBean.setFilter(filter);
    filterRegistrationBean.setEnabled(false);
    return filterRegistrationBean;
  }
  
  // This setting is to enable support for Apache Commons FileUpload package. 
  @Bean
  public CommonsMultipartResolver commonsMultipartResolver() {
    CommonsMultipartResolver commonsMultipartResolver = new CommonsMultipartResolver();
    commonsMultipartResolver.setMaxUploadSizePerFile(104857600);
    return new CommonsMultipartResolver();
  }
  
  
  @Bean
  public ServletRegistrationBean SRBConfigPropertiesServlt() {
    return new ServletRegistrationBean(new ConfigPropertiesServlt(), "/config");
  }
  
  @Bean
  public ServletRegistrationBean SRBConfigViewerServlt() {
    return new ServletRegistrationBean(new ConfigViewerServlt(), "/config-viewer");
  }
  
  @Bean
  public ServletRegistrationBean SRBCreateUser() {
    return new ServletRegistrationBean(new CreateUser(), "/create-user");
  }
  
  @Bean
  public ServletRegistrationBean SRBCustomerLoggingServlet() {
    return new ServletRegistrationBean(new CustomerLoggingServlet(), "/CustomerDataServlet");
  }
  
  @Bean
  public ServletRegistrationBean SRBCustomizeToolbar() {
    return new ServletRegistrationBean(new CustomizeToolbar(), "/customize-navbar");
  }
  
  @Bean
  public ServletRegistrationBean SRBDownloadFileLinksServlt() {
    return new ServletRegistrationBean(new DownloadFileLinksServlt(), "/download-file-links");
  }
  
  @Bean
  public ServletRegistrationBean SRBDownloadSlidesServlet() {
    return new ServletRegistrationBean(new DownloadSlidesServlet(), "/file/*");
  }
  
  @Bean
  public ServletRegistrationBean SRBGetMessageDataServlet() {
    return new ServletRegistrationBean(new GetMessageDataServlet(), "/GetMessageDataServlet");
  }
  
  @Bean
  public ServletRegistrationBean SRBFileViewerServlet() {
    return new ServletRegistrationBean(new FileViewerServlet(), "/view");
  }
  
  @Bean
  public ServletRegistrationBean SRBHubSpot() {
    return new ServletRegistrationBean(new HubSpot(), "/integration/hubspot");
  }

  @Bean
  public ServletRegistrationBean SRBKeepAliveServlet() {
    return new ServletRegistrationBean(new KeepAliveServlet(), "/KeepAliveServlet");
  }

  @Bean
  public ServletRegistrationBean SRBManagementServlet() {
    return new ServletRegistrationBean(new ManagementServlet(), "/ManagementServlet");
  }

  @Bean
  public ServletRegistrationBean SRBReportsServlet() {
    return new ServletRegistrationBean(new ReportsServlet(), "/ReportsServlet");
  }

  @Bean
  public ServletRegistrationBean SRBSalesmanLoggingServlet() {
    return new ServletRegistrationBean(new SalesmanLoggingServlet(), "/SalesmanDataServlet");
  }

  @Bean
  public ServletRegistrationBean SRBUploadCustomers() {
    return new ServletRegistrationBean(new UploadCustomers(), "/uploadCustomers");
  }
  
  @Bean
  public ServletRegistrationBean SRBUploadFile() {
    return new ServletRegistrationBean(new UploadFile(), "/upload-file");
  }
  
  @Bean
  public ServletRegistrationBean SRBGetDocumentSharingProperties() {
    return new ServletRegistrationBean(new DocumentShareServlet(), "/share");
  }
}