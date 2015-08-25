
package slidepiper.chat.springsockets.config;

import slidepiper.chat.springsockets.handler.ChatWebSocketHandler;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.DefaultServletHandlerConfigurer;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.PerConnectionWebSocketHandler;
import org.springframework.web.socket.server.standard.*;

@Configuration
@EnableWebMvc
@EnableWebSocket
@ComponentScan(basePackages={"slidepiper.chat.springsockets.service"})
public class WebConfig extends WebMvcConfigurerAdapter implements WebSocketConfigurer {
	
	  @Bean
	    public ServletServerContainerFactoryBean createWebSocketContainer() {
	        ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
	        
	        // 10sec timeout - should be enough.
	        // NOT GOOD - if no msgs in 10sec it disconnects.
	        // Let's make it 1 hour.
	        container.setMaxSessionIdleTimeout(1000 * 60 * 60);
	        
//	        container.setMaxTextMessageBufferSize(8192);
	//        container.setMaxBinaryMessageBufferSize(8192);
	        return container;
	    }

  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
	  System.out.println("WEBSOCKETS: adding chat handler");
	  
	  // very important: allow all origins, otherwise it's forbidden 403
	    // when used on openshift.
	  // added the .setallowed inside.	  
	  	//	  http://docs.spring.io/spring/docs/current/spring-framework-reference/htmlsingle/#websocket-server-allowed-origins
	  	  
    registry.addHandler(chatWebSocketHandler(), "/chat")    
    .setAllowedOrigins("*").withSockJS();
        
  }
  
  @Bean
  public WebSocketHandler chatWebSocketHandler() {
	  System.out.println("WEBSOCKETS: returning chat ws handler");
    return new PerConnectionWebSocketHandler(ChatWebSocketHandler.class);
  }


  // Allow serving HTML files through the default Servlet
  @Override
  public void configureDefaultServletHandling(DefaultServletHandlerConfigurer configurer) {
	  System.out.println("WEBSOCKETS: enabling configurer");
          configurer.enable();
  }

}
