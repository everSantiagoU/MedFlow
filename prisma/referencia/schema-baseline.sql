-- REFERENCIA SOLAMENTE. Prisma no ejecuta ni administra este DDL.
-- Captura del esquema MySQL existente antes del corte a Node.js.

/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` text,
  `fin` datetime(6) NOT NULL,
  `inicio` datetime(6) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `doctor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK11xlxjjoffpeel21ao5w8388g` (`doctor_id`),
  CONSTRAINT `FK11xlxjjoffpeel21ao5w8388g` FOREIGN KEY (`doctor_id`) REFERENCES `doctores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estado` varchar(50) NOT NULL,
  `fecha_hora` datetime(6) NOT NULL,
  `doctor_id` int NOT NULL,
  `paciente_id` int NOT NULL,
  `procedimiento_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKa0culq17omm7ln12kktrip4em` (`doctor_id`),
  KEY `FKnqrsxxcuysfcxiekvixm7h8r1` (`paciente_id`),
  KEY `FKllkd41ffg9sk7hxbwnamrnfyg` (`procedimiento_id`),
  CONSTRAINT `FKa0culq17omm7ln12kktrip4em` FOREIGN KEY (`doctor_id`) REFERENCES `doctores` (`id`),
  CONSTRAINT `FKllkd41ffg9sk7hxbwnamrnfyg` FOREIGN KEY (`procedimiento_id`) REFERENCES `procedimientos` (`id`),
  CONSTRAINT `FKnqrsxxcuysfcxiekvixm7h8r1` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `doctores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(120) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `registro_medico` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKd73enkt3ggy3dlibgn86qs5ea` (`email`),
  UNIQUE KEY `UKrxi7ou0oc024hmqknfdof0cr5` (`registro_medico`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `eventos_calendario` (
  `id` int NOT NULL AUTO_INCREMENT,
  `descripcion` text,
  `fin` datetime(6) NOT NULL,
  `inicio` datetime(6) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `doctor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_eventos_calendario_doctor` (`doctor_id`),
  CONSTRAINT `fk_eventos_calendario_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `estado_pago` varchar(50) NOT NULL,
  `fecha_emision` datetime(6) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `cita_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKibamxjwt2ca4vhe9401i2hfrb` (`cita_id`),
  CONSTRAINT `FKq9vi47c56fdqslypxnlj8l2f8` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historias_clinicas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha_registro` datetime(6) NOT NULL,
  `observaciones` text NOT NULL,
  `cita_id` int NOT NULL,
  `doctor_id` int NOT NULL,
  `paciente_id` int NOT NULL,
  `datos_relevantes` text NOT NULL,
  `diagnostico` text NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK2v09fptijg4p3nws06297uol4` (`cita_id`),
  KEY `FKg1khn522eg7918px2b46n8mh2` (`doctor_id`),
  KEY `FKr14j0egr7g6kw0h3r2jb1ft55` (`paciente_id`),
  CONSTRAINT `FK575fsj4ihg5ptmjun1jwp7q6g` FOREIGN KEY (`cita_id`) REFERENCES `citas` (`id`),
  CONSTRAINT `FKg1khn522eg7918px2b46n8mh2` FOREIGN KEY (`doctor_id`) REFERENCES `doctores` (`id`),
  CONSTRAINT `FKr14j0egr7g6kw0h3r2jb1ft55` FOREIGN KEY (`paciente_id`) REFERENCES `pacientes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pacientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `direccion` varchar(200) NOT NULL,
  `documento` varchar(30) NOT NULL,
  `email` varchar(120) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKpmbbinegtxye4liqd61ionaau` (`documento`),
  UNIQUE KEY `UKa83ft0lfk8ltx47ve931qw2kq` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `procedimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `duracion_minutos` int NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(120) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('ADMIN','MEDICO','PACIENTE') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkfsp0s1tflm1cwlj8idhqsad0` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

