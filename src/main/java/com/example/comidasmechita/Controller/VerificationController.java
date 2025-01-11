package com.example.comidasmechita.Controller;

import com.example.comidasmechita.Entity.VerificationCode;
import com.example.comidasmechita.Repository.VerificationCodeRepository;
import com.example.comidasmechita.Services.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/verification")
@CrossOrigin("*")
public class VerificationController {
    @Autowired
    private VerificationService verificationService;

    @Autowired
    private VerificationCodeRepository codeRepository;

    @PostMapping("/send")
    public ResponseEntity<String> sendVerificationCode(@RequestParam String email) {
        verificationService.generateVerificationCode(email);
        return ResponseEntity.ok("Código de verificación enviado");
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyCode(@RequestParam String email, @RequestParam String code) {
        VerificationCode verificationCode = codeRepository.findByEmailAndCode(email, code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código incorrecto o expirado"));

        if (verificationCode.getExpiration().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código ha expirado");
        }

        // Aquí puedes proceder con la creación de la cuenta
        return ResponseEntity.ok("Código verificado exitosamente");
    }
}
