param($installPath, $toolsPath, $package, $project)

$MvcVersion = 5;
foreach($item in $project.Object.References)
{
	if ($item.Name -eq 'System.Web.Mvc')
	{
		if ($item.MajorVersion  -eq 3)
		{
			$MvcVersion = 3;
		}
		if ($item.MajorVersion  -eq 4)
		{
			$MvcVersion = 4;
		}
		if ($item.MajorVersion  -eq 5)
		{
			$MvcVersion = 5;
		}
	}
}
if($MvcVersion -eq 3)
{
	$project.Object.References | Where-Object { $_.Name -eq 'MVC4ControlsToolkit' -or $_.Name -eq 'MVC5ControlsToolkit'} | ForEach-Object { $_.Remove() }
}
if($MvcVersion -eq 4)
{
	$project.Object.References | Where-Object { $_.Name -eq 'MVC3ControlsToolkit' -or $_.Name -eq 'MVC5ControlsToolkit'} | ForEach-Object { $_.Remove() }
}
if($MvcVersion -eq 5)
{
	$project.Object.References | Where-Object { $_.Name -eq 'MVC3ControlsToolkit' -or $_.Name -eq 'MVC4ControlsToolkit'} | ForEach-Object { $_.Remove() }
}
