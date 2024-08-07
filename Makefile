export TAG=latest
ecr.login:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 381491975528.dkr.ecr.us-east-1.amazonaws.com

# Backend commands
image.build.local.backend:
	docker build --platform linux/amd64 -t weather-app-backend:$(TAG) node-backend
image.tag.ecr.backend:
	docker tag weather-app-backend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:$(TAG); docker tag 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:latest;
image.push.ecr.backend:
	docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:$(TAG); docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-backend:latest;
image.build-tag-push.ecr.backend:
	make ecr.login;
	make TAG=$(TAG) image.build.local.backend;
	make TAG=$(TAG) image.tag.ecr.backend;
	make TAG=$(TAG) image.push.ecr.backend;

# Frontend commands
image.build.local.frontend:
	docker build --platform linux/amd64 --build-arg NEXT_PUBLIC_API_URL=http://weather-app-alb-865442402.us-east-1.elb.amazonaws.com -t weather-app-frontend:$(TAG) frontend
image.tag.ecr.frontend:
	docker tag weather-app-frontend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:$(TAG); docker tag 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:$(TAG) 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:latest;
image.push.ecr.frontend:
	docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:$(TAG); docker push 381491975528.dkr.ecr.us-east-1.amazonaws.com/weather-app-frontend:latest;
image.build-tag-push.ecr.frontend:
	make ecr.login;
	make TAG=$(TAG) image.build.local.frontend;
	make TAG=$(TAG) image.tag.ecr.frontend;
	make TAG=$(TAG) image.push.ecr.frontend;