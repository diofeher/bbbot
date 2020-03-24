FROM ubuntu

# Install system dependencies
#
#	Python dependencies
#		python-dev python-pip python-setuptools
#
#	Scrapy dependencies
#		libffi-dev libxml2-dev libxslt1-dev
#
#	Pillow (Python Imaging Library) dependencies
#		libtiff4-dev libjpeg8-dev zlib1g-dev libfreetype6-dev
# 		liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk
#
# set noninteractive installation
RUN export DEBIAN_FRONTEND=noninteractive
#install tzdata package
RUN apt-get update
RUN apt-get install -y tzdata cron
# set your timezone
RUN ln -fs /usr/share/zoneinfo/America/New_York /etc/localtime

RUN apt-get install -y \
			python-dev python-pip python-setuptools \
			libffi-dev libxml2-dev libxslt1-dev \
			libtiff5-dev libjpeg8-dev zlib1g-dev libfreetype6-dev \
			liblcms2-dev libwebp-dev tcl8.5-dev tk8.5-dev python-tk

# Node dependencies
RUN apt-get install -y nodejs npm
COPY images .
COPY package.json .
COPY bbb.py .
COPY server.js .
COPY requirements.txt .
RUN pip install -r requirements.txt && rm requirements.txt
ENTRYPOINT ["npm", "start"]

# Copy hello-cron file to the cron.d directory
COPY cron-delete /etc/cron.d/hello-cron
# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/hello-cron
# Apply cron job
RUN crontab /etc/cron.d/hello-cron
# Create the log file to be able to run tail
RUN touch /var/log/cron.log
# Run the command on container startup
CMD cron && tail -f /var/log/cron.log
