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
	$scope.unscheduled_points = 0.0;
	$scope.unstarted_points = 0.1;
	$scope.started_points = 0.5;
	$scope.finished_points = 0.8;
	$scope.delivered_points = 0.9;
	$scope.accepted_points = 1.0;
	$scope.rejected_points = 0.6;
	$scope.unpointed_points = 2.0;
	$scope.chore_points = 1.0;
	
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
					'X-TrackerToken':token
				}
		};
		$http.get($scope.api_prefix + "projects/",$scope.config).success(function (data, status, headers, config) {
			$scope.projects = data.projects;
			$scope.working = false;
		}).error(function (data, status, headers, config) {
			$scope.current_status = "Error: " + status;
			$scope.working = false;
		});
	};
	
	$scope.getStatsPerEpic = function () {
		$scope.working = true;
		$scope.current_status = "Getting List of Epics...";
		$http.get(api_prefix + "projects/" + project_id + "/epics/").success(function (data, status, headers, config) {
			$scope.epics = data.epics;
			getStories();
			$scope.working = false;
			$scope.current_status = "Status Report Generated";
		}).error(function (data, status, headers, config) {
			$scope.current_status = "Error: " + status;
			$scope.working = false;
		});
	};
	
	$scope.getStories = function () {
		$scope.working = true;
		$scope.current_status = "Getting List of Stories...";
		for (var e=0; e<$scope.epics.length; e++) {
			var epic = $scope.epics[e];
			$http.get(api_prefix + "projects/" + project_id + "/stories?with_label/" + epic.name).success(function (data, status, headers, config) {
				$scope.stories = data.stories;
				epic.total_points = 0;
				epic.completed_points = 0;
				for (var s=0; s<$scope.stories.length; s++) {
					var story = $scope.stories[s];
					story.non_mvp = false;
					for (var l=0; s<story.labels.length; l++) {
						if (story.labels[l].name == ignore_label) {
						  non_mvp = true;
						  break;
						}
					}
					if (!non_mvp) {
						story.points = (story.hasOwnProperty('estimate')) ? story.estimate : ((story.hasOwnProperty('story_type') && story.story_type == 'feature') ? unpointed_points : chore_points);
						epic.total_points += story.points;
						epic.completed_points += story.points * parseFloat($('#' + stories[i].current_state + '_points')[0].value);
					}
				}
			}).error(function (data, status, headers, config) {
				$scope.current_status = "Error: " + status;
				$scope.working = false;
			});
			$scope.aggregate_complete += epic.completed_points;
			$scope.aggregate_total += epic.total_points;
			
		}

	};
});

