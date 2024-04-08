/* Database SQL Script */

DROP TABLE IF EXISTS `Task`;
DROP TABLE IF EXISTS `Notification`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `Note`;
DROP TABLE IF EXISTS `Material`;
DROP TABLE IF EXISTS `Worktime`;
DROP TABLE IF EXISTS `AccessCodes`;
DROP TABLE IF EXISTS `ConstructionSite`;
DROP TABLE IF EXISTS `ConstructionSiteWorker`;
DROP TRIGGER IF EXISTS insert_creator_to_workers;

CREATE TABLE ConstructionSite (
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(40) NOT NULL,
	modifiedAt VARCHAR(30) NOT NULL,
	status VARCHAR(30) NOT NULL,
	createdBy JSON NOT NULL,
	customerName VARCHAR(40),
	customerEmail VARCHAR(50),
	customerAddress VARCHAR(50),
	customerZip INT,
	customerCity VARCHAR(40),
	customerPhone INT
);

CREATE TABLE Task (
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(60) NOT NULL,
	text VARCHAR(1200),
	modifiedAt VARCHAR(30),
	createdAt VARCHAR(30) NOT NULL,
	status VARCHAR(30) NOT NULL,
	priority VARCHAR(30) NOT NULL,
	assignedTo JSON NOT NULL,
	constructionSiteId INT(6) UNSIGNED,
	createdBy JSON NOT NULL,
	CONSTRAINT `FK_Task_ConstructionSite` FOREIGN KEY (constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE
);

CREATE TABLE Notification (
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type VARCHAR(40) NOT NULL,
	text VARCHAR(140)NOT NULL,
	timestamp VARCHAR(30) NOT NULL,
	constructionSiteId INT(6) UNSIGNED,
	CONSTRAINT `FK_Notification_ConstructionSite` FOREIGN KEY (constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE
);

CREATE TABLE `User`(
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(40) NOT NULL UNIQUE,
	email VARCHAR(50) NOT NULL UNIQUE,
	address VARCHAR(50),
	zip INT,
	city VARCHAR(40),
	phone INT UNSIGNED,
	language VARCHAR(5),
	status VARCHAR(30) NOT NULL,
	role VARCHAR(30) NOT NULL,
	password CHAR(60)
);

CREATE TABLE Note (
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(60) NOT NULL,
	text VARCHAR(1200) NOT NULL,
	createdBy JSON NOT NULL,
	modifiedAt VARCHAR(30) NOT NULL,
	constructionSiteId INT(6) UNSIGNED,
	CONSTRAINT `FK_Note_ConstructionSite` FOREIGN KEY (constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE
);

CREATE TABLE Material (
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(40) NOT NULL,
	amount int UNSIGNED NOT NULL,
	unit VARCHAR(30),
	createdBy JSON NOT NULL,
	modifiedAt VARCHAR(30) NOT NULL,
	constructionSiteId INT(6) UNSIGNED,
	CONSTRAINT `FK_Material_ConstructionSite` FOREIGN KEY (constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE
);

CREATE TABLE Worktime (
	id INT(6) UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	hours int UNSIGNED NOT NULL,
	minutes int UNSIGNED NOT NULL,
	start VARCHAR(30) NOT NULL,
	end VARCHAR(30) NOT NULL,
	createdBy JSON NOT NULL,
	text VARCHAR(1200) NOT NULL,
	modifiedAt VARCHAR(30) NOT NULL,
	constructionSiteId INT(6) UNSIGNED,
	CONSTRAINT `FK_Worktime_ConstructionSite` FOREIGN KEY (constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE
);

CREATE TABLE AccessCodes (
	token VARCHAR(36) NOT NULL PRIMARY KEY,
	email VARCHAR(50) NOT NULL UNIQUE,
	reason VARCHAR(30) NOT NULL, /* reset, invite */
	createdAt datetime NOT NULL,
	permission VARCHAR(30) DEFAULT NULL /* only set if user is invited */
);

CREATE TABLE Permission (
	name VARCHAR(30) NOT NULL PRIMARY KEY,
	permissions JSON NOT NULL
);

CREATE TABLE ConstructionSiteWorker (
	userId INT(6) UNSIGNED,
	constructionSiteId INT(6) UNSIGNED,
	CONSTRAINT `FK_userId_User` FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
	CONSTRAINT `FK_constructionSiteId_ConstructionSite` FOREIGN KEY (constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE,
	PRIMARY KEY (userid, constructionSiteId)
);

DELIMITER $$

CREATE TRIGGER insert_creator_to_workers
AFTER INSERT
ON ConstructionSite FOR EACH ROW
BEGIN
    IF NEW.createdBy->"$.userId" IS NOT NULL THEN
        INSERT INTO ConstructionSiteWorker(userId, constructionSiteId)
        VALUES(new.createdBy->"$.userId", new.id);
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE TRIGGER insert_new_notification
AFTER INSERT
ON Notification FOR EACH ROW
BEGIN
	DECLARE notificationCount INT;
	SET notificationCount = (SELECT Count(id) FROM `Notification`); 
  
	IF notificationCount >= 30 THEN
		DELETE FROM `Notification` WHERE id NOT IN (select id from (SELECT id FROM `Notification` ORDER BY timestamp DESC LIMIT 6) as s);
	END IF;
END$$

DELIMITER ;

CREATE TABLE MaterialAutocomplete (
	name VARCHAR(40) NOT NULL PRIMARY KEY
);

CREATE TABLE UnitAutocomplete (
	name VARCHAR(30) NOT NULL PRIMARY KEY
);

CREATE TABLE ConstructionSiteImage (
	imagename VARCHAR(40) NOT NULL PRIMARY KEY,
	constructionSiteId INT(6) UNSIGNED,
	CONSTRAINT `FK_ConstructionSite_Image` FOREIGN KEY(constructionSiteId) REFERENCES ConstructionSite(id) ON DELETE CASCADE
);

/* Example data */
INSERT INTO `User` (`id`, `name`, `email`, `address`, `zip`, `city`, `phone`, `language`, `status`, `role`, `password`) VALUES
(1, 'Kevin Test', 'kevinmisic+admin@googlemail.com', 'musterstraße 24', 64293, 'Darmstadt', 123456789, 'de', 'active', 'admin', '$2b$10$/cLklLAVUNCkA0kPgeXCeuk7Bf5ZqPjmZDvsMkYRsak6A1t9c2UCm');
INSERT INTO `User` (`id`, `name`, `email`, `address`, `zip`, `city`, `phone`, `language`, `status`, `role`, `password`) VALUES
(2, 'Max Mustermann', 'Kevin.Portugal@web.de', 'musterstraße 12', 64295, 'Kranichstein', 431256789, 'de', 'active', 'admin', '$2b$10$/cLklLAVUNCkA0kPgeXCeuk7Bf5ZqPjmZDvsMkYRsak6A1t9c2UCm');
INSERT INTO `User`( `name`, `email`, `status`, `role`) VALUES ('Admin-Test','kevinmisic+admin2@googlemail.com','invited','admin');
INSERT INTO `AccessCodes`(`token`,  `email`, `reason`, `createdAt`) VALUES ('1de02ade-2393-11eb-adc1-0242ac120002','kevinmisic+admin2@googlemail.com','invitation','2017-06-15 09:34:21');


INSERT INTO `ConstructionSite` (`id`, `name`, `modifiedAt`, `status`, `createdBy`, `customerName`, `customerEmail`, `customerAddress`, `customerZip`, `customerCity`, `customerPhone`) VALUES
(1, 'Testbaustelle', '2020-11-01T17:15:07.981Z', 'open', '{"user": "Kevin Test", "userId": 1}', 'Max Musterman', 'Mustermail@muster.testing.yxm', 'Musterstraße 9', 64284, 'Darmstadt', 123456789),
(2, 'Testbaustelle_07', '2020-11-01T17:21:04.879Z', 'completed', '{"user": "Kevin Test", "userId": 1}', 'Rudolf Test', 'rudolf.rentier@weihnachten.test.yxm', 'Schneeflockenstraße 12', 62694, 'Nordpol', 21345495);

INSERT INTO `Worktime` (`id`, `hours`, `minutes`, `start`, `end`, `text`, `createdBy`, `modifiedAt`, `constructionSiteId`) VALUES (NULL, '5', '45', '2020-01-11T09:12:17.000Z', '2020-01-11T14:57:57.000Z', 'Türrahmen abgeschliffen', '{"user": "Kevin Test", "userId": 1}', '2020-01-11T14:57:57.000Z', 1);
INSERT INTO `Worktime` (`id`, `hours`, `minutes`, `start`, `end`, `text`, `createdBy`, `modifiedAt`, `constructionSiteId`) VALUES (NULL, '7', '25', '2020-01-11T08:12:57.000Z', '2020-01-11T15:37:59.000Z', 'Fenster eingebaut', '{"user": "Kevin Test", "userId": 1}', '2020-01-11T15:37:59.000Z', 1);

INSERT INTO `ConstructionSiteWorker` (`userId`,`constructionSiteId`) VALUES (1,2);
INSERT INTO `ConstructionSiteWorker` (`userId`,`constructionSiteId`) VALUES (2,2);

INSERT INTO `Permission` (`name`, `permissions`) VALUES
('admin', '{\"note\": {\"read\": true, \"write\": true}, \"task\": {\"read\": true, \"write\": true}, \"users\": {\"read\": true, \"write\": true}, \"material\": {\"read\": true, \"write\": true}, \"worktime\": {\"read\": true, \"write\": true}, \"imageUpload\": {\"read\": true, \"write\": true}, \"notification\": {\"read\": true}, \"constructionSite\": {\"read\": true, \"write\": true}}'),
('employee', '{\"note\": {\"read\": true, \"write\": true}, \"task\": {\"read\": true, \"write\": true}, \"users\": {\"read\": true, \"write\": false}, \"material\": {\"read\": true, \"write\": true}, \"worktime\": {\"read\": true, \"write\": true}, \"imageUpload\": {\"read\": true, \"write\": true}, \"notification\": {\"read\": true}, \"constructionSite\": {\"read\": true, \"write\": false}}');
