package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.MenuEntity;
import com.example.comidasmechita.Services.MenuService;
import com.example.comidasmechita.Services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;


@RestController
@RequestMapping("/menu")
@CrossOrigin("*")
public class MenuController {
    @Autowired
    private MenuService menuService;
    @Autowired
    private UsuarioService usuarioService;


    @GetMapping
    public List<MenuEntity> getAllMenus() {
        return menuService.getAllMenus();
    }

    @GetMapping("/obtener/{id}")
    public Optional<MenuEntity> getMenuById(@PathVariable Long id) {
        return menuService.getMenuById(id);
    }

    @PostMapping("/crearmenu")
    public ResponseEntity<MenuEntity> createMenu(@RequestParam Long userId, @RequestBody MenuEntity menu) {
        if (usuarioService.isAdmin(userId)) {
            MenuEntity createdMenu = menuService.saveMenu(menu);
            return new ResponseEntity<>(createdMenu, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<Void> deleteMenu(@RequestParam Long userId, @PathVariable Long id) {
        try {
            if (usuarioService.isAdmin(userId)) {
                menuService.deleteMenu(id);
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            } else {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } catch (NoSuchElementException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND); // Si el menú o usuario no existe
        } catch (Exception e) {
            e.printStackTrace(); // Agregar log para identificar el error
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<MenuEntity> updateMenu(@RequestParam Long userId, @PathVariable Long id, @RequestBody MenuEntity menu) {
        if (usuarioService.isAdmin(userId)) {
            menu.setId(id);
            MenuEntity updatedMenu = menuService.updateMenu(menu);
            return new ResponseEntity<>(updatedMenu, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }
}
