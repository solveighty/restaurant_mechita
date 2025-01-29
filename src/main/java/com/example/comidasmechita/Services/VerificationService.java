package com.example.comidasmechita.Services;

import com.example.comidasmechita.Entity.VerificationCode;
import com.example.comidasmechita.Repository.VerificationCodeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class VerificationService {
    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private VerificationCodeRepository codeRepository;

    public String generateVerificationCode(String email) {
        String code = String.valueOf((int) (Math.random() * 900000) + 100000);
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setExpiration(LocalDateTime.now().plusMinutes(3));
        codeRepository.save(verificationCode);

        sendVerificationEmail(email, code);
        return code;
    }

    private void sendVerificationEmail(String email, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Código de Verificación - Comidas Mechita");
        message.setText("Hola,\n\n" +
                "Gracias por registrarte en Comidas Mechita. Para completar tu proceso de registro, por favor ingresa el siguiente código de verificación en la página web:\n\n" +
                "Código: " + code + "\n\n" +
                "Este código es válido por 3 minutos. Si no solicitaste este código, ignora este mensaje.\n\n" +
                "¡Gracias por confiar en nosotros!\n\n" +
                "Saludos,\n" +
                "El equipo de Comidas Mechita");
        mailSender.send(message);
    }
}
