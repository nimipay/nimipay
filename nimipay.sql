-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 06, 2019 at 01:25 PM
-- Server version: 5.7.19
-- PHP Version: 7.1.9

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nimipay`
--

-- --------------------------------------------------------

--
-- Table structure for table `nimipay_invoices`
--

DROP TABLE IF EXISTS `nimipay_invoices`;
CREATE TABLE IF NOT EXISTS `nimipay_invoices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_invoice` varchar(100) COLLATE utf8_bin NOT NULL,
  `type` varchar(100) COLLATE utf8_bin NOT NULL,
  `value` varchar(100) COLLATE utf8_bin NOT NULL,
  `address` varchar(100) COLLATE utf8_bin NOT NULL,
  `tx` varchar(100) COLLATE utf8_bin NOT NULL,
  `status` varchar(100) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=82 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `nimipay_items`
--

DROP TABLE IF EXISTS `nimipay_items`;
CREATE TABLE IF NOT EXISTS `nimipay_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_invoice` varchar(100) COLLATE utf8_bin NOT NULL,
  `type` varchar(50) COLLATE utf8_bin NOT NULL,
  `content` varchar(10000) COLLATE utf8_bin NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=64 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

-- --------------------------------------------------------

--
-- Table structure for table `nimipay_users`
--

DROP TABLE IF EXISTS `nimipay_users`;
CREATE TABLE IF NOT EXISTS `nimipay_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `address` varchar(100) COLLATE utf8_bin NOT NULL,
  `label` varchar(100) COLLATE utf8_bin NOT NULL,
  `login_first` timestamp NOT NULL,
  `login_last` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=73 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
