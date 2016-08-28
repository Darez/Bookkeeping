FROM centos:centos7

MAINTAINER http://www.centos.org
LABEL Vendor="CentOS"
LABEL License=GPLv2
LABEL Version=2.4.6-31

RUN yum -y install epel-release
RUN yum -y update && yum clean all
RUN yum -y install php-devel php-pear gcc gcc-c++ autoconf automake make php-composer-installers httpd php php-pdo php-pgsql php-gd php-mcrypt ImageMagick git && yum clean all
RUN pecl install Xdebug

COPY httpd.conf /etc/httpd/conf/httpd.conf
COPY php.ini /etc/php.ini
COPY xdebug.ini /etc/php.d/xdebug.ini

EXPOSE 80

# Simple startup script to avoid some issues observed with container restart 
ADD run-httpd.sh /run-httpd.sh
RUN chmod -v +x /run-httpd.sh

CMD ["/run-httpd.sh"]
