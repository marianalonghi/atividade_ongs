
package br.com.ongs.atividadeongs.controller;

import br.com.ongs.atividadeongs.models.PerfilUsuario;
import br.com.ongs.atividadeongs.models.Usuario;
import br.com.ongs.atividadeongs.repository.UsuarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;

    public UsuarioController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    // Listar todos os usuarios cadastrados
    @GetMapping("/todos")
    public ResponseEntity<List<Usuario>> listarTodos() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    // Buscar um usuario pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cadastrar um novo usuario
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody Usuario usuario) {

        if (usuario.getNome() == null ||
                usuario.getNome().isBlank() ||
                usuario.getEmail() == null ||
                usuario.getEmail().isBlank()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem",
                            "Nome e email sao obrigatorios."));
        }

        // Verificar se o email ja esta cadastrado
        if (usuarioRepository.findByEmailIgnoreCase(usuario.getEmail())
                .isPresent()) {

            return ResponseEntity.badRequest()
                    .body(Map.of("mensagem", "Email ja cadastrado."));
        }

        // O banco gera o ID automaticamente
        usuario.setId(null);

        // Novos usuarios recebem o perfil padrao
        usuario.setPerfil(PerfilUsuario.USUARIO);

        Usuario novoUsuario = usuarioRepository.save(usuario);

        return ResponseEntity
                .created(URI.create("/api/usuarios/" + novoUsuario.getId()))
                .body(novoUsuario);
    }

    // Manter compatibilidade com o front-end atual
    @GetMapping
    public ResponseEntity<Map<String, Object>> listar() {
        return ResponseEntity.ok(
                Map.of("padrinhoAtual", Map.of())
        );
    }
}
