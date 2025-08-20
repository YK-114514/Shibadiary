-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: user_db
-- ------------------------------------------------------
USE user_db;
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `collect`
--

DROP TABLE IF EXISTS `collect`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `collect` (
  `idcollect` int NOT NULL AUTO_INCREMENT,
  `userid_collect` varchar(45) NOT NULL,
  `id_from_post` int NOT NULL,
  PRIMARY KEY (`idcollect`),
  UNIQUE KEY `idcollect_UNIQUE` (`idcollect`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `collect`
--

LOCK TABLES `collect` WRITE;
/*!40000 ALTER TABLE `collect` DISABLE KEYS */;
INSERT INTO `collect` VALUES (13,'2',13),(16,'3',15),(22,'3',26);
/*!40000 ALTER TABLE `collect` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `idcomments` int NOT NULL AUTO_INCREMENT,
  `content` varchar(45) NOT NULL,
  `id_from_post` int NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_user` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `parent_user_id` int DEFAULT NULL,
  PRIMARY KEY (`idcomments`),
  UNIQUE KEY `idcomments_UNIQUE` (`idcomments`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (46,'测试',21,'2025-07-25 22:11:11',2,NULL,NULL),(47,'评论测试',22,'2025-07-26 12:23:40',2,NULL,NULL),(48,'回复测试',21,'2025-07-26 12:40:20',2,46,2),(49,'测试',21,'2025-07-26 12:48:39',3,46,2),(50,'测试',22,'2025-07-26 13:33:55',3,47,2),(51,'测试',22,'2025-07-26 18:12:23',3,NULL,NULL),(52,'测试',22,'2025-07-26 18:12:26',3,NULL,NULL),(53,'测试',22,'2025-07-26 18:12:35',3,NULL,NULL),(55,'测试',22,'2025-07-26 18:12:47',3,NULL,NULL),(56,'测试1',22,'2025-07-26 18:24:38',3,NULL,NULL),(57,'测试2',22,'2025-07-26 18:24:41',3,NULL,NULL),(58,'测试3',22,'2025-07-26 18:24:45',3,NULL,NULL),(60,'测试5',22,'2025-07-26 18:24:53',3,NULL,NULL),(61,'测试回复1',22,'2025-07-26 20:04:45',3,60,3),(62,'测试回复2',22,'2025-07-26 20:04:56',3,60,3),(63,'试试',22,'2025-07-26 20:21:15',3,NULL,NULL),(64,'评论咯',22,'2025-07-26 20:25:07',3,NULL,NULL),(65,'你好',22,'2025-07-26 20:25:19',3,60,3),(66,'不能回复吗',22,'2025-07-27 01:41:19',3,61,3),(67,'不能回复吗',22,'2025-07-27 01:42:15',3,61,3),(68,'能回复吗',22,'2025-07-27 01:42:38',3,64,3),(69,'测试一下哦',22,'2025-07-27 02:11:11',3,68,3),(70,'hi',22,'2025-07-27 02:33:00',3,55,3),(71,'hii',22,'2025-07-27 02:33:10',3,70,3),(73,'不会你也可以回复吧',22,'2025-07-27 02:46:42',3,66,3),(74,'尝试回复',22,'2025-07-27 02:50:54',3,67,3);
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `follows`
--

DROP TABLE IF EXISTS `follows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `follows` (
  `id` int NOT NULL AUTO_INCREMENT,
  `follower_id` int NOT NULL,
  `following_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_follow` (`follower_id`,`following_id`),
  KEY `following_id` (`following_id`),
  CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `user` (`id_user`),
  CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `follows`
--

LOCK TABLES `follows` WRITE;
/*!40000 ALTER TABLE `follows` DISABLE KEYS */;
INSERT INTO `follows` VALUES (14,4,3,'2025-07-26 14:48:28'),(16,3,2,'2025-07-26 15:04:22'),(18,2,3,'2025-07-26 15:57:00'),(19,3,7,'2025-07-26 19:43:14'),(20,12,3,'2025-07-27 03:05:49');
/*!40000 ALTER TABLE `follows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `idlike` int NOT NULL AUTO_INCREMENT,
  `userid_like` varchar(45) NOT NULL,
  `id_from_post` int NOT NULL,
  PRIMARY KEY (`idlike`),
  UNIQUE KEY `idlike_UNIQUE` (`idlike`)
) ENGINE=InnoDB AUTO_INCREMENT=133 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (5,'2',9),(6,'3',9),(7,'2',6),(36,'2',16),(109,'3',12),(114,'3',13),(116,'2',12),(120,'3',16),(121,'2',13),(123,'3',15),(126,'3',21),(128,'3',23),(129,'2',22),(130,'3',22),(131,'3',26),(132,'3',28);
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` int NOT NULL AUTO_INCREMENT,
  `target_id` int NOT NULL,
  `kind` varchar(45) NOT NULL,
  `from_id` int DEFAULT NULL,
  `from_post_id` int DEFAULT NULL,
  `isread` tinyint DEFAULT '0',
  `time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES (3,3,'like',3,13,1,'2025-07-23 16:25:06'),(12,3,'comment',2,21,1,'2025-07-25 14:03:57'),(13,3,'comment',2,21,1,'2025-07-25 14:06:52'),(14,3,'comment',2,21,1,'2025-07-25 14:07:05'),(15,3,'comment',2,21,1,'2025-07-25 14:11:11'),(16,3,'comment',2,22,1,'2025-07-26 04:23:40'),(17,3,'comment',2,21,1,'2025-07-26 04:40:20'),(18,2,'reply',3,22,1,'2025-07-26 05:33:55'),(19,2,'like',3,23,1,'2025-07-26 06:17:28'),(20,3,'like',2,22,1,'2025-07-26 08:33:09'),(21,2,'like',3,28,1,'2025-07-26 14:30:29'),(25,3,'follow',2,NULL,1,'2025-07-26 15:33:41'),(26,3,'follow',4,NULL,1,'2025-07-26 15:56:00'),(27,3,'follow',2,NULL,1,'2025-07-26 15:57:00'),(28,7,'follow',3,NULL,0,'2025-07-26 19:43:14'),(29,3,'follow',12,NULL,0,'2025-07-27 03:05:50');
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `post_infom`
--

DROP TABLE IF EXISTS `post_infom`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `post_infom` (
  `id` int NOT NULL AUTO_INCREMENT,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `content` varchar(255) NOT NULL,
  `type` varchar(45) NOT NULL,
  `id_user` int NOT NULL,
  `images` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `post_infom`
--

LOCK TABLES `post_infom` WRITE;
/*!40000 ALTER TABLE `post_infom` DISABLE KEYS */;
INSERT INTO `post_infom` VALUES (28,'2025-07-26 21:17:54','这是我的第一条测试帖子！','帖子',2,NULL),(29,'2025-07-26 20:17:54','这是第二条测试帖子，看看效果如何','帖子',2,NULL),(30,'2025-07-26 19:17:54','第三条测试帖子，测试用户主页功能','帖子',2,NULL);
/*!40000 ALTER TABLE `post_infom` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  `phone` varchar(45) NOT NULL,
  `avatar` varchar(45) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `following` varchar(1000) DEFAULT NULL,
  `fans` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `id_user_UNIQUE` (`id_user`),
  UNIQUE KEY `phone_UNIQUE` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'niconico','19941373333','/images/avatars/avatar_2_1753361592843.webp','$2b$10$xpfoqSYfgTzf15pbv3GWUeeb6baAqBAI8pKw1ixy8VGYOArGL3Xsq','',NULL),(2,'Niconiconiconi','13999999999','/images/avatars/avatar_2_1753361592843.webp','$2b$10$CYYgCpieOvGoZQGCidgXxupfBVVrhUaHIVuj28Lphi2iUfHf/t6Vi','3','3'),(3,'testAccount','19999999999','/images/avatars/avatar_3_1753427881441.webp','$2b$10$.DCoUV7b.G4wnQMiuzx/vOp1R8kvhbpIy8bynISAoCuZ0YHtPQCei','2,7','4,2,12'),(4,'tt','15711111111','/images/default_avatar.jpg','$2b$10$uIOdKO.eSKtmbXy.JrfoFOgXVrecP.CnaBYOdYlHqzJ5ce3tSKHyq','3',NULL),(7,'newtest','15333333333','/images/default_avatar.jpg','$2b$10$uQBlTIUPpw1.lRkaHBvpmOKnwKqwlQoHGVk.0QeuWlKVT9me/2dqW',NULL,'3'),(10,'NewUser1753549488436','15749488436','/images/default_avatar.jpg','$2b$10$aEZks5w7cc35Nc51oB42QeCiEFeTlCN7XQNNFnraLUt1Z7Z5GEoBm',NULL,NULL),(11,'NewUser1753549743808','15749743808','/images/default_avatar.jpg','$2b$10$KpdOn9FGriDakn7xnKQ.CuLE8zYpX1CDRIGVedDx3SKmViCaA4Jqe',NULL,NULL),(12,'testAccount2','15444444444','/images/default_avatar.jpg','$2b$10$Ha50FKTHyNNpbJDgEFVPPeg4.Tg2cZ4OD19mOZBYpuEoCmbo.j.t6','3',NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-27 19:21:39
