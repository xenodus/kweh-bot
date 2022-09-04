-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 04, 2022 at 05:57 AM
-- Server version: 10.5.10-MariaDB-log
-- PHP Version: 7.3.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kweh-bot`
--

-- --------------------------------------------------------

--
-- Table structure for table `commands`
--

CREATE TABLE `commands` (
  `id` int(11) NOT NULL,
  `command` varchar(255) NOT NULL,
  `user_id` varchar(188) NOT NULL,
  `username` varchar(255) NOT NULL,
  `server_id` varchar(188) NOT NULL,
  `hash` varchar(188) NOT NULL DEFAULT '',
  `result` longtext DEFAULT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `discord_users_oauth`
--

CREATE TABLE `discord_users_oauth` (
  `id` int(11) NOT NULL,
  `discord_id` varchar(188) NOT NULL,
  `token` varchar(188) NOT NULL,
  `refresh_token` varchar(188) NOT NULL,
  `token_expiry` datetime NOT NULL,
  `nickname` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `avatar` varchar(255) NOT NULL,
  `date_added` datetime NOT NULL,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `lodestone_id` varchar(188) NOT NULL,
  `name` varchar(255) NOT NULL,
  `date_start` datetime NOT NULL,
  `date_end` datetime NOT NULL,
  `url` varchar(255) NOT NULL,
  `type` enum('maintenance') NOT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `fashion_report_posted`
--

CREATE TABLE `fashion_report_posted` (
  `id` int(11) NOT NULL,
  `report_id` varchar(188) NOT NULL,
  `channel_id` varchar(188) NOT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `fashion_report_subscription`
--

CREATE TABLE `fashion_report_subscription` (
  `id` int(11) NOT NULL,
  `server_id` varchar(188) NOT NULL,
  `channel_id` varchar(188) NOT NULL,
  `channel_name` varchar(255) NOT NULL,
  `updated_by_user_id` varchar(188) NOT NULL,
  `date_added` datetime NOT NULL,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `id` int(11) NOT NULL,
  `item_id` varchar(188) NOT NULL,
  `type` enum('item','recipe') NOT NULL DEFAULT 'item',
  `data` mediumtext NOT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `news_posted`
--

CREATE TABLE `news_posted` (
  `id` int(11) NOT NULL,
  `news_id` varchar(188) NOT NULL,
  `channel_id` varchar(188) NOT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `news_subscription`
--

CREATE TABLE `news_subscription` (
  `id` int(11) NOT NULL,
  `server_id` varchar(188) NOT NULL,
  `channel_id` varchar(188) NOT NULL,
  `channel_name` varchar(255) NOT NULL,
  `locale` enum('na','eu','jp','fr','de') DEFAULT 'na',
  `categories` set('topics','notices','maintenance','updates','status','developers') NOT NULL DEFAULT 'topics,notices,maintenance,updates,status,developers',
  `updated_by_user_id` varchar(188) NOT NULL,
  `date_added` datetime NOT NULL,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `servers`
--

CREATE TABLE `servers` (
  `id` int(11) NOT NULL,
  `server_id` varchar(188) NOT NULL,
  `name` varchar(255) NOT NULL,
  `prefix` char(1) NOT NULL DEFAULT '!',
  `language` enum('en','jp','fr','de') NOT NULL DEFAULT 'en',
  `auto_delete` tinyint(1) NOT NULL DEFAULT 0,
  `date_added` datetime NOT NULL,
  `last_active` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `server_default_channel`
--

CREATE TABLE `server_default_channel` (
  `id` int(11) NOT NULL,
  `server_id` varchar(188) NOT NULL,
  `channel_id` varchar(188) NOT NULL,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `user_id` varchar(188) NOT NULL,
  `lodestone_id` varchar(188) NOT NULL,
  `dc` varchar(255) NOT NULL,
  `server` varchar(255) NOT NULL DEFAULT '',
  `region` varchar(255) NOT NULL DEFAULT '',
  `firstname` varchar(255) NOT NULL,
  `lastname` varchar(255) NOT NULL,
  `date_added` datetime NOT NULL,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `user_profile`
--

CREATE TABLE `user_profile` (
  `id` int(11) NOT NULL,
  `lodestone_id` varchar(188) NOT NULL,
  `url` varchar(255) NOT NULL,
  `date_added` datetime NOT NULL,
  `last_updated` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `commands`
--
ALTER TABLE `commands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hash` (`hash`),
  ADD KEY `server_command_date` (`server_id`,`date_added`);

--
-- Indexes for table `discord_users_oauth`
--
ALTER TABLE `discord_users_oauth`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `discord_id_unique` (`discord_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lodestone_id` (`lodestone_id`);

--
-- Indexes for table `fashion_report_posted`
--
ALTER TABLE `fashion_report_posted`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `news_id_x_channel_id` (`report_id`,`channel_id`);

--
-- Indexes for table `fashion_report_subscription`
--
ALTER TABLE `fashion_report_subscription`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `server_id` (`server_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item_id` (`item_id`),
  ADD KEY `itemid_x_type` (`item_id`,`type`);

--
-- Indexes for table `news_posted`
--
ALTER TABLE `news_posted`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `news_id_x_channel_id` (`news_id`,`channel_id`);

--
-- Indexes for table `news_subscription`
--
ALTER TABLE `news_subscription`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `server_id` (`server_id`);

--
-- Indexes for table `servers`
--
ALTER TABLE `servers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `server_id` (`server_id`);

--
-- Indexes for table `server_default_channel`
--
ALTER TABLE `server_default_channel`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `user_profile`
--
ALTER TABLE `user_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`lodestone_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `commands`
--
ALTER TABLE `commands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `discord_users_oauth`
--
ALTER TABLE `discord_users_oauth`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fashion_report_posted`
--
ALTER TABLE `fashion_report_posted`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fashion_report_subscription`
--
ALTER TABLE `fashion_report_subscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `news_posted`
--
ALTER TABLE `news_posted`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `news_subscription`
--
ALTER TABLE `news_subscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `servers`
--
ALTER TABLE `servers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `server_default_channel`
--
ALTER TABLE `server_default_channel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_profile`
--
ALTER TABLE `user_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
