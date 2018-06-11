package com.slidepiper;


import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TestController {


    @GetMapping(value = "/test")
    public String getHome(Model model){

        model.addAttribute("testName","Works fine!");

        return "index";
    }

}
