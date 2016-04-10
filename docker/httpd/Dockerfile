FROM centos:centos7

MAINTAINER http://www.centos.org
LABEL Vendor="CentOS"
LABEL License=GPLv2
LABEL Version=2.4.6-31

RUN yum -y update && yum clean all
RUN yum -y install httpd php php-pdo php-pgsql php-gd ImageMagick && yum clean all

COPY httpd.conf /etc/httpd/conf/httpd.conf
COPY php.ini /etc/php.ini

EXPOSE 80

# Simple startup script to avoid some issues observed with container restart 
ADD run-httpd.sh /run-httpd.sh
RUN chmod -v +x /run-httpd.sh

CMD ["/run-httpd.sh"]
