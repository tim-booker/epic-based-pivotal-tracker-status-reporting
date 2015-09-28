var app = angular.module('status-report', []);
app.controller('status-controller',function ($scope, $http) {
	//status
	$scope.current_status = "Generating Status Report...";
		
	//data
	$scope.projects = [];
	$scope.epics = [];
	$scope.stories = [];
	$scope.aggregate_complete = 0.0;
	$scope.aggregate_total = 0;
	
	//point weightings
	$scope.pointSettings = new Array();
	$scope.pointSettings["unscheduled"] = 0.0;
	$scope.pointSettings["unstarted"] = 0.1;
	$scope.pointSettings["started"] = 0.5;
	$scope.pointSettings["finished"] = 0.8;
	$scope.pointSettings["delivered"] = 0.9;
	$scope.pointSettings["accepted"] = 1.0;
	$scope.pointSettings["rejected"] = 0.6;
	$scope.pointSettings["unpointed"] = 2.0;
	$scope.pointSettings["chore"] = 1.0;
	
	//settings		
	$scope.ignore_label = "non-mvp";
	$scope.project_id = 0;
	$scope.token = "";
	$scope.working = false;
	$scope.api_prefix = "https://www.pivotaltracker.com/services/v5/";

	$scope.getProjects = function () {
		$scope.working = true;
		$scope.current_status = "Getting List of Projects...";
		$scope.config = {
				headers: {
					'X-TrackerToken':$scope.token
				}
		};
		$http.get($scope.api_prefix + "projects/",$scope.config).success(function (data, status, headers, config) {
			$scope.projects = data;
			$scope.working = false;
		}).error(function (data, status, headers, config) {
			$scope.current_status = "Error: " + status;
			$scope.working = false;
		});
	};
	
	$scope.getStatsPerEpic = function () {
		$scope.working = true;
		$scope.current_status = "Getting List of Epics...";
		$http.get($scope.api_prefix + "projects/" + $scope.project_id + "/epics/",$scope.config).success(function (data, status, headers, config) {
			$scope.epics = data;
			$scope.current_status = "Getting List of Stories...";
			for (var e=0; e<$scope.epics.length; e++) {
				var epic = $scope.epics[e];
				$http.get($scope.api_prefix + "projects/" + $scope.project_id + "/stories?with_label=" + epic.label.name,$scope.config).success(function (data, status, headers, config) {
					$scope.stories = data;
					epic.total_points = 0;
					epic.completed_points = 0;
					for (var s=0; s<$scope.stories.length; s++) {
						var story = $scope.stories[s];
						story.non_mvp = false;
						for (var l=0; l<story.labels.length; l++) {
							if (story.labels[l].name == $scope.ignore_label) {
							  non_mvp = true;
							  break;
							}
						}
						if (!story.non_mvp) {
							story.points = (story.hasOwnProperty('estimate')) ? story.estimate : ((story.hasOwnProperty('story_type') && story.story_type == 'feature') ? $scope.pointSettings["unpointed"] : $scope.pointSettings["chore"]);
							epic.total_points += story.points;
							epic.completed_points += story.points * parseFloat($scope.pointSettings[story.current_state]);
						}
					}
				}).error(function (data, status, headers, config) {
					$scope.current_status = "Error: " + status;
					$scope.working = false;
				});
				$scope.aggregate_complete += epic.completed_points;
				$scope.aggregate_total += epic.total_points;
				
			}
			$scope.working = false;
			$scope.current_status = "Status Report Generated";
		}).error(function (data, status, headers, config) {
			$scope.current_status = "Error: " + status;
			$scope.working = false;
		});
	};
	
	
});

