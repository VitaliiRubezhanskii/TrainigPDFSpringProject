
package springsockets.config;

import javax.servlet.ServletRegistration.Dynamic;



import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;


public class DispatcherServletInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

  @Override
  protected Class<?>[] getRootConfigClasses() {
	  System.out.println("WEBSOCKETS: Get root config");
          return null;
  }

  @Override
  protected Class<?>[] getServletConfigClasses() {
	  System.out.println("WEBSOCKETS: get svlt config");
          return new Class<?>[] { WebConfig.class };
  }

  @Override
  protected String[] getServletMappings() {
          return new String[] { "/" };
  }

  @Override
  protected void customizeRegistration(Dynamic registration) {
	  System.out.println("WEBSOCKETS: customize registration");
          registration.setInitParameter("dispatchOptionsRequest", "true");
  }

}