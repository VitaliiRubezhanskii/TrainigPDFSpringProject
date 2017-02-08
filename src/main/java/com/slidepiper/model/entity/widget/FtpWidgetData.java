package com.slidepiper.model.entity.widget;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import lombok.Getter;

@Getter
public class FtpWidgetData {
  public enum Scheme {SFTP};
  private Scheme scheme;
  
  @NotNull private String username;
  @NotNull private String password;
  @NotNull private String host;
  private int port;
  @Pattern(regexp = "^[/].*[^/]$") private String path;
}
